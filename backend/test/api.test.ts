import 'dotenv/config';
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync, ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { createHmac } from 'node:crypto';
import { createServer } from 'node:net';
import { PrismaClient } from '@prisma/client';
import { seed } from '../prisma/seed';

let base: string;
let child: ChildProcess;
let database: PrismaClient;
const origin = 'http://localhost:5173';
const environment = {
  ...process.env,
  DATABASE_URL: process.env.TEST_DATABASE_URL,
  NODE_ENV: 'test',
  PAYMENT_DEMO_ENABLED: 'true',
  SESSION_SECRET: 'test-only-session-secret-with-more-than-32-characters',
  JWT_SECRET: 'test-only-jwt-secret-that-is-different-from-the-session-one',
  UPLOAD_LIMIT: '5',
};

function encode(value: unknown) {
  return Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString(
    'base64url',
  );
}
function decode(token: string) {
  const [header, payload] = token.split('.');
  return {
    header: JSON.parse(Buffer.from(header, 'base64url').toString()),
    payload: JSON.parse(Buffer.from(payload, 'base64url').toString()),
  };
}
function forge(claims: Record<string, unknown>, options: { secret?: string; alg?: string } = {}) {
  const alg = options.alg || 'HS256';
  const header = encode({ alg, typ: 'JWT' });
  const payload = encode(claims);
  if (alg === 'none') {
    return `${header}.${payload}.`;
  }
  const digest = alg === 'HS512' ? 'sha512' : 'sha256';
  const signature = createHmac(digest, options.secret || environment.JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}
function median(values: number[]) {
  return [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
}

class Client {
  cookies = new Map<string, string>();
  async send(path: string, method = 'GET', body?: unknown, extra: Record<string, string> = {}) {
    const response = await fetch(base + path, {
      method,
      headers: {
        Origin: origin,
        Cookie: [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; '),
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...extra,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    for (const cookie of response.headers.getSetCookie()) {
      const pair = cookie.split(';')[0];
      const index = pair.indexOf('=');
      this.cookies.set(pair.slice(0, index), pair.slice(index + 1));
    }
    return {
      status: response.status,
      headers: response.headers,
      body: response.status === 204 ? null : await response.json(),
    };
  }
  async mutate(path: string, method: string, body?: unknown) {
    const csrf = await this.send('/auth/csrf');
    assert.equal(csrf.status, 200);
    return this.send(path, method, body, { 'X-CSRF-Token': csrf.body.data.token });
  }
  async login(email = 'deva@example.com') {
    const result = await this.mutate('/auth/login', 'POST', { email, password: 'demo123' });
    assert.equal(result.status, 200, JSON.stringify(result.body));
    return result.body.data;
  }
  async register(name: string) {
    const result = await this.mutate('/auth/register', 'POST', {
      name,
      email: `${name.toLowerCase()}@example.com`,
      password: 'demo123',
      location: 'Kendari',
    });
    assert.equal(result.status, 201, JSON.stringify(result.body));
    return result.body.data;
  }
}

async function boot() {
  const socket = createServer();
  await new Promise<void>((resolve) => socket.listen(0, '127.0.0.1', resolve));
  const address = socket.address() as { port: number };
  await new Promise<void>((resolve) => socket.close(() => resolve()));
  const port = String(address.port);
  base = `http://127.0.0.1:${port}/api/v1`;
  child = spawn(process.execPath, ['dist/main.js'], {
    env: { ...environment, PORT: port },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  let errors = '';
  child.stderr?.on('data', (chunk) => {
    errors = (errors + chunk).slice(-2000);
  });
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error(`API exited: ${errors}`);
    try {
      if ((await fetch(base + '/health')).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`API did not become ready: ${errors}`);
}
async function stop() {
  if (child && child.exitCode === null) {
    const closed = once(child, 'exit');
    child.kill();
    await closed;
  }
}

before(async () => {
  const target = new URL(environment.DATABASE_URL || '');
  assert(['localhost', '127.0.0.1', '[::1]'].includes(target.hostname));
  assert.equal(
    target.pathname,
    '/sewaskill_test',
    'Only the named local test database may be cleared',
  );
  assert.notEqual(environment.DATABASE_URL, process.env.DATABASE_URL);
  execFileSync(process.execPath, ['../node_modules/prisma/build/index.js', 'migrate', 'deploy'], {
    env: environment,
    stdio: 'pipe',
  });
  database = new PrismaClient({ datasourceUrl: environment.DATABASE_URL });
  await database.$executeRawUnsafe(
    'TRUNCATE "BalanceEntry", "ActivityLog", "RecentView", "Favorite", "Review", "Order", "ServicePackage", "Service", "User", "session" CASCADE',
  );
  await seed(database);
  await boot();
});
after(async () => {
  await stop();
  await database?.$disconnect();
});

test('REST API, domain invariants, isolation, and restart persistence', async (t) => {
  const buyer = new Client();
  const seller = new Client();
  const admin = new Client();
  let buyerUser: any;
  let sellerUser: any;
  let createdService: any;
  let createdOrder: any;

  await t.test('public projections, pagination, filters, and strict DTOs', async () => {
    const result = await buyer.send('/services?pageSize=2');
    assert.equal(result.status, 200);
    assert.equal(result.body.data.length, 2);
    assert.equal(result.body.meta.total, 6);
    assert(!JSON.stringify(result.body).match(/password|balance|sessionVersion|deva@example/));
    const video = await buyer.send('/services?category=video&minPrice=50000&maxPrice=60000');
    assert.equal(video.body.data.length, 1);
    assert.equal(video.body.data[0].id, 't1');
    assert.equal((await buyer.send('/services?pageSize=101')).status, 400);
    assert.equal((await buyer.send('/services?minPrice=9&maxPrice=1')).status, 400);
    assert.equal((await buyer.send('/services?unexpected=1')).status, 400);
    assert.equal((await buyer.send('/admin/users')).status, 401);
  });

  await t.test('CSRF, origin, registration boundaries, cookie flags, and login', async () => {
    assert.equal(
      (await buyer.send('/auth/login', 'POST', { email: 'deva@example.com', password: 'demo123' }))
        .status,
      403,
    );
    const csrf = await buyer.send('/auth/csrf');
    assert.equal(
      (
        await buyer.send(
          '/auth/login',
          'POST',
          { email: 'deva@example.com', password: 'demo123' },
          { Origin: 'https://untrusted.example', 'X-CSRF-Token': csrf.body.data.token },
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await buyer.mutate('/auth/register', 'POST', {
          name: 'Bad',
          email: 'bad@example.com',
          password: 'demo123',
          location: 'Kendari',
          role: 'admin',
        })
      ).status,
      400,
    );
    buyerUser = await buyer.login();
    sellerUser = await seller.login('rizky@example.com');
    await admin.login('admin@example.com');
    assert.equal(typeof buyerUser.balance, 'number');
    assert(!Object.hasOwn(buyerUser, 'passwordHash'));
    const session = await buyer.send('/auth/me');
    assert.equal(session.body.data.id, buyerUser.id);
    assert.equal((await buyer.send('/admin/users')).status, 403);
    const other = new Client();
    const registration = await other.mutate('/auth/register', 'POST', {
      name: 'New User',
      email: 'NEW@example.com',
      password: 'demo123',
      location: 'Kendari',
    });
    assert.equal(registration.status, 201);
    assert.equal(registration.body.data.role, 'pencari');
    assert.match(registration.headers.get('set-cookie')!, /HttpOnly/);
    assert.match(registration.headers.get('set-cookie')!, /SameSite=Lax/);
    assert.equal(
      (
        await new Client().mutate('/auth/register', 'POST', {
          name: 'Duplicate',
          email: 'new@example.com',
          password: 'demo123',
          location: 'Kendari',
        })
      ).status,
      409,
    );
    await other.mutate('/auth/logout', 'POST');
    assert.equal((await other.send('/auth/me')).status, 401);
    buyerUser = await buyer.register('FlowBuyer');
    assert.equal(buyerUser.balance, 500000);
  });

  await t.test(
    'service ownership, package validation, moderation, favorites, reviews, and profile location',
    async () => {
      const draft = {
        title: 'API test design',
        category: 'desain',
        description: 'Description for the integration test.',
        days: 3,
        packages: [{ name: 'Standard', description: '', price: 85000 }],
      };
      const result = await seller.mutate('/services', 'POST', draft);
      assert.equal(result.status, 201, JSON.stringify(result.body));
      createdService = result.body.data;
      assert.equal(
        (await buyer.mutate('/services/' + createdService.id, 'PATCH', draft)).status,
        403,
      );
      assert.equal(
        (
          await seller.mutate('/services', 'POST', {
            ...draft,
            packages: [
              { name: 'Same', price: 1 },
              { name: 'same', price: 2 },
            ],
          })
        ).status,
        400,
      );
      assert.equal(
        (
          await seller.mutate('/services', 'POST', {
            ...draft,
            packages: [{ id: 't2-p1', name: 'Other', price: 1 }],
          })
        ).status,
        400,
      );
      await seller.mutate('/users/me', 'PATCH', { name: sellerUser.name, location: 'Bandung' });
      assert.equal(
        (await buyer.send('/services/' + createdService.id)).body.data.location,
        'Bandung',
      );
      assert.equal(
        (await buyer.mutate('/users/me/favorites/' + createdService.id, 'PUT')).status,
        200,
      );
      assert.equal(
        (await buyer.mutate('/users/me/favorites/' + createdService.id, 'PUT')).status,
        200,
      );
      const favorites = await buyer.send('/users/me/favorites');
      assert.equal(favorites.body.data.filter((s: any) => s.id === createdService.id).length, 1);
      const review = await buyer.mutate(`/services/${createdService.id}/reviews`, 'POST', {
        rating: 5,
        comment: 'Good work',
      });
      assert.equal(review.status, 201);
      assert.equal(
        (
          await buyer.mutate(`/services/${createdService.id}/reviews`, 'POST', {
            rating: 4,
            comment: 'Duplicate',
          })
        ).status,
        409,
      );
      assert.equal(
        (
          await buyer.mutate('/reviews/' + review.body.data.id, 'PATCH', {
            rating: 4,
            comment: 'Updated',
          })
        ).status,
        200,
      );
      assert.equal((await seller.mutate('/reviews/' + review.body.data.id, 'DELETE')).status, 403);
      assert.equal((await buyer.mutate('/reviews/' + review.body.data.id, 'DELETE')).status, 204);
      await admin.mutate(`/admin/services/${createdService.id}/moderation`, 'PATCH', {
        hidden: true,
      });
      assert.equal((await buyer.send('/services/' + createdService.id)).status, 404);
      assert.equal((await seller.send('/users/me/services/' + createdService.id)).status, 200);
      await admin.mutate(`/admin/services/${createdService.id}/moderation`, 'PATCH', {
        hidden: false,
      });
    },
  );

  const makeOrder = async (client: Client, service = createdService) => {
    const result = await client.mutate('/orders', 'POST', {
      serviceId: service.id,
      packageId: service.packages[0].id,
      brief: 'A valid brief for testing',
      paymentMethod: 'bca',
      attachments: [],
    });
    assert.equal(result.status, 201, JSON.stringify(result.body));
    return result.body.data;
  };
  const deliverAndReview = async (order: any, client = buyer, accepted = true) => {
    assert.equal(
      (
        await seller.mutate(`/orders/${order.id}/delivery`, 'POST', {
          resultUrl: 'https://example.com/result',
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await client.mutate(`/orders/${order.id}/decision`, 'POST', {
          accepted,
          ...(!accepted ? { complaint: 'Needs another revision' } : {}),
        })
      ).status,
      200,
    );
  };

  await t.test(
    'server pricing, failed payments, ownership, deletion guards, snapshots, settlement, and history',
    async () => {
      const sellerBalance = (await seller.send('/auth/me')).body.data.balance;
      createdOrder = await makeOrder(buyer);
      assert.equal(createdOrder.price, 85000);
      assert.equal(createdOrder.fee, 4250);
      assert.equal(createdOrder.total, 89250);
      assert.equal((await seller.send('/orders/' + createdOrder.id)).status, 200);
      const outsider = new Client();
      await outsider.register('Outsider');
      assert.equal((await outsider.send('/orders/' + createdOrder.id)).status, 404);
      assert.equal(
        (await outsider.mutate(`/orders/${createdOrder.id}/payment`, 'POST', { success: true }))
          .status,
        404,
      );
      assert.equal(
        (await buyer.mutate('/users/me', 'DELETE', { confirmation: 'HAPUS' })).status,
        409,
      );
      assert.equal((await seller.mutate('/services/' + createdService.id, 'DELETE')).status, 409);
      assert.equal(
        (await buyer.mutate(`/orders/${createdOrder.id}/payment`, 'POST', { success: false }))
          .status,
        200,
      );
      assert.equal((await buyer.send('/auth/me')).body.data.balance, 500000);
      const attempts = await Promise.all([
        buyer.mutate(`/orders/${createdOrder.id}/payment`, 'POST', { success: true }),
        buyer.mutate(`/orders/${createdOrder.id}/payment`, 'POST', { success: true }),
      ]);
      assert.deepEqual(attempts.map((r) => r.status).sort(), [200, 409]);
      assert.equal((await buyer.send('/auth/me')).body.data.balance, 410750);
      const edit = {
        title: 'Changed service title',
        category: 'desain',
        description: 'Updated description for the integration test.',
        days: 4,
        packages: [{ id: createdService.packages[0].id, name: 'Renamed', price: 90000 }],
      };
      assert.equal(
        (await seller.mutate('/services/' + createdService.id, 'PATCH', edit)).status,
        200,
      );
      const snapshot = (await buyer.send('/orders/' + createdOrder.id)).body.data;
      assert.equal(snapshot.packageName, 'Standard');
      assert.equal(snapshot.price, 85000);
      await deliverAndReview(createdOrder);
      const resolution = await Promise.all([
        admin.mutate(`/admin/orders/${createdOrder.id}/review`, 'POST', { approve: true }),
        admin.mutate(`/admin/orders/${createdOrder.id}/review`, 'POST', { approve: true }),
      ]);
      assert.deepEqual(resolution.map((r) => r.status).sort(), [200, 409]);
      assert.equal((await seller.send('/auth/me')).body.data.balance, sellerBalance + 85000);
      assert.equal(await database.balanceEntry.count({ where: { orderId: createdOrder.id } }), 2);
      assert.equal(
        (await buyer.mutate(`/orders/${createdOrder.id}/history`, 'DELETE')).status,
        204,
      );
      assert(!(await buyer.send('/orders')).body.data.some((o: any) => o.id === createdOrder.id));
      assert(
        (await seller.send('/orders?view=incoming')).body.data.some(
          (o: any) => o.id === createdOrder.id,
        ),
      );
    },
  );

  await t.test('refund path and competing approval/refund cannot duplicate balance', async () => {
    const service = (await buyer.send('/services/t1')).body.data;
    const before = (await buyer.send('/auth/me')).body.data.balance;
    const order = await makeOrder(buyer, service);
    await buyer.mutate(`/orders/${order.id}/payment`, 'POST', { success: true });
    await deliverAndReview(order, buyer, false);
    assert.equal(
      (await admin.mutate(`/admin/orders/${order.id}/review`, 'POST', { approve: false })).status,
      200,
    );
    assert.equal((await buyer.send('/auth/me')).body.data.balance, before);
    const race = await makeOrder(buyer, service);
    await buyer.mutate(`/orders/${race.id}/payment`, 'POST', { success: true });
    await deliverAndReview(race);
    const results = await Promise.all([
      admin.mutate(`/admin/orders/${race.id}/review`, 'POST', { approve: true }),
      admin.mutate(`/admin/orders/${race.id}/review`, 'POST', { approve: false }),
    ]);
    assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
    assert.equal(
      await database.balanceEntry.count({ where: { operationKey: `resolution:${race.id}` } }),
      1,
    );
  });

  await t.test(
    'different concurrent payments cannot overdraw a shared balance; cancel/pay race remains valid',
    async () => {
      const low = new Client();
      await low.register('Limited');
      const highServiceResult = await seller.mutate('/services', 'POST', {
        title: 'Expensive test service',
        category: 'koding',
        description: 'Concurrent payment isolation test.',
        days: 2,
        packages: [{ name: 'Full', price: 400000 }],
      });
      const service = highServiceResult.body.data;
      const orders = [await makeOrder(low, service), await makeOrder(low, service)];
      const results = await Promise.all(
        orders.map((order) => low.mutate(`/orders/${order.id}/payment`, 'POST', { success: true })),
      );
      assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
      assert.equal((await low.send('/auth/me')).body.data.balance, 80000);
      const cheap = await makeOrder(buyer, (await buyer.send('/services/t1')).body.data);
      const race = await Promise.all([
        buyer.mutate(`/orders/${cheap.id}/payment`, 'POST', { success: true }),
        buyer.mutate(`/orders/${cheap.id}/cancel`, 'POST'),
      ]);
      assert.deepEqual(race.map((r) => r.status).sort(), [200, 409]);
      const current = await database.order.findUniqueOrThrow({ where: { id: cheap.id } });
      assert(['dibayar', 'dibatalkan'].includes(current.status));
      assert.equal(
        await database.balanceEntry.count({ where: { orderId: cheap.id } }),
        current.status === 'dibayar' ? 1 : 0,
      );
    },
  );

  await t.test(
    'admin boundaries, blocked session revocation, ledger adjustment, and soft deletion',
    async () => {
      const fresh = new Client();
      const user = await fresh.register('Manageable');
      assert.equal(
        (
          await admin.mutate('/admin/users/' + user.id, 'PATCH', {
            password: '',
            name: 'Manageable Updated',
          })
        ).status,
        200,
      );
      assert.equal(
        (await admin.mutate('/admin/users/' + user.id, 'PATCH', { name: null })).status,
        400,
      );
      assert.equal((await admin.mutate('/admin/users/admin', 'DELETE')).status, 404);
      assert.equal(
        (await admin.mutate('/admin/users/admin', 'PATCH', { name: 'Changed' })).status,
        404,
      );
      assert.equal(
        (await admin.mutate('/admin/users/' + user.id, 'PATCH', { role: 'admin' })).status,
        400,
      );
      assert.equal(
        (
          await admin.mutate('/admin/users/' + user.id, 'PATCH', {
            balance: 120000,
            status: 'diblokir',
          })
        ).status,
        200,
      );
      assert.equal((await fresh.send('/auth/me')).status, 401);
      assert.equal(
        await database.balanceEntry.count({ where: { userId: user.id, kind: 'adjustment' } }),
        1,
      );
      await admin.mutate('/admin/users/' + user.id, 'PATCH', { status: 'aktif' });
      await fresh.login(user.email);
      await fresh.mutate('/users/me', 'DELETE', { confirmation: 'HAPUS' });
      assert.equal((await fresh.send('/auth/me')).status, 401);
      assert.notEqual(
        (await database.user.findUniqueOrThrow({ where: { id: user.id } })).deletedAt,
        null,
      );
      const dashboard = await seller.send('/dashboard/provider');
      assert.equal(dashboard.status, 200);
      assert(dashboard.body.data.revenue >= 85000);
      assert.equal((await admin.send('/admin/summary')).status, 200);
      assert.equal((await admin.send('/admin/logs?pageSize=2')).body.data.length, 2);
    },
  );

  await t.test(
    'recent views keep 12 unique entries and provider conversion retains purchase access',
    async () => {
      const ids: string[] = [];
      for (let index = 0; index < 14; index++) {
        const result = await seller.mutate('/services', 'POST', {
          title: `Recent service ${index}`,
          category: 'desain',
          description: 'Service for recent view limits.',
          days: 1,
          packages: [{ name: 'Basic', price: 10000 }],
        });
        assert.equal(result.status, 201);
        ids.push(result.body.data.id);
        assert.equal(
          (await buyer.mutate('/users/me/recent/' + result.body.data.id, 'POST')).status,
          200,
        );
      }
      const recent = await buyer.send('/users/me/recent');
      assert.equal(recent.body.data.length, 12);
      assert.equal(new Set(recent.body.data.map((s: any) => s.id)).size, 12);
      assert(!recent.body.data.some((s: any) => s.id === ids[0]));
      await buyer.mutate('/users/me/recent/' + ids[2], 'POST');
      assert.equal((await buyer.send('/users/me/recent')).body.data[0].id, ids[2]);
      const converted = new Client();
      const account = await converted.register('Converted');
      const order = await makeOrder(converted, (await converted.send('/services/t1')).body.data);
      assert.equal(
        (
          await converted.mutate('/users/me/provider', 'POST', {
            skills: 'Design',
            experience: 'A sample portfolio',
          })
        ).status,
        200,
      );
      assert.equal((await converted.send('/auth/me')).body.data.role, 'penyedia');
      assert.equal(
        (
          await converted.mutate('/orders', 'POST', {
            serviceId: 't1',
            packageId: 't1-p1',
            brief: 'Another order',
            paymentMethod: 'bca',
          })
        ).status,
        403,
      );
      assert.equal((await converted.mutate(`/orders/${order.id}/cancel`, 'POST')).status, 200);
      assert.equal(
        (await converted.mutate('/users/me', 'DELETE', { confirmation: 'HAPUS' })).status,
        204,
      );
      assert.notEqual(
        (await database.user.findUniqueOrThrow({ where: { id: account.id } })).deletedAt,
        null,
      );
    },
  );

  await t.test('admin adjustment and payment races reconcile against the ledger', async () => {
    const client = new Client();
    const account = await client.register('AdjustmentRace');
    const order = await makeOrder(client, (await client.send('/services/t1')).body.data);
    const results = await Promise.all([
      client.mutate(`/orders/${order.id}/payment`, 'POST', { success: true }),
      admin.mutate(`/admin/users/${account.id}`, 'PATCH', { balance: 600000 }),
    ]);
    assert(results.every((r) => r.status === 200));
    const user = await database.user.findUniqueOrThrow({ where: { id: account.id } });
    assert([600000n, 547500n].includes(user.balance));
    const entries = await database.balanceEntry.findMany({ where: { userId: account.id } });
    assert.equal(
      entries.reduce((sum, row) => sum + row.amount, 0n),
      user.balance,
    );
  });

  await t.test('per-account authentication rate limits include request IDs', async () => {
    const client = new Client();
    const limit = Number(process.env.AUTH_ACCOUNT_LIMIT || 30);
    let result;
    for (let attempt = 0; attempt <= limit; attempt++)
      result = await client.mutate('/auth/login', 'POST', {
        email: 'rate-test@example.com',
        password: 'wrong-password',
      });
    assert.equal(result!.status, 429);
    assert.equal(result!.body.error.code, 'RATE_LIMIT');
    assert.equal(typeof result!.body.requestId, 'string');
  });

  await t.test('seed is non-destructive; sessions and records survive API restart', async () => {
    const count = await database.order.count();
    const balance = (await buyer.send('/auth/me')).body.data.balance;
    await seed(database);
    assert.equal(await database.order.count(), count);
    assert.equal((await buyer.send('/auth/me')).body.data.balance, balance);
    await stop();
    await boot();
    assert.equal((await buyer.send('/auth/me')).body.data.id, buyerUser.id);
    assert.equal((await buyer.send('/orders/' + createdOrder.id)).body.data.status, 'selesai');
  });
});

test('JWT authentication: cookie flags, claims, forgery, revocation, and bearer mode', async (t) => {
  async function bearerLogin(email = 'deva@example.com') {
    const client = new Client();
    const csrf = await client.send('/auth/csrf');
    const result = await client.send(
      '/auth/login',
      'POST',
      { email, password: 'demo123' },
      { 'X-CSRF-Token': csrf.body.data.token, 'X-Auth-Mode': 'bearer' },
    );
    assert.equal(result.status, 200, JSON.stringify(result.body));
    return result.body.data.token as string;
  }
  function me(token: string) {
    return new Client().send('/auth/me', 'GET', undefined, { Authorization: `Bearer ${token}` });
  }

  await t.test(
    'login issues an HttpOnly SameSite=Lax HS256 token with minimal claims',
    async () => {
      const client = new Client();
      const result = await client.mutate('/auth/login', 'POST', {
        email: 'deva@example.com',
        password: 'demo123',
      });
      assert.equal(result.status, 200);
      const cookie = result.headers.getSetCookie().find((c) => c.startsWith('sewaskill.token='));
      assert(cookie, 'token cookie missing');
      assert.match(cookie, /HttpOnly/i);
      assert.match(cookie, /SameSite=Lax/i);
      assert.match(cookie, /Path=\//);
      const { header, payload } = decode(client.cookies.get('sewaskill.token')!);
      assert.equal(header.alg, 'HS256');
      assert.equal(payload.iss, 'sewaskill');
      assert.equal(payload.aud, 'sewaskill-app');
      assert.equal(typeof payload.jti, 'string');
      assert.equal(typeof payload.sub, 'string');
      assert.equal(payload.exp - payload.iat, Number(environment.SESSION_DAYS || 7) * 86400);
      for (const key of ['role', 'email', 'balance', 'name', 'password']) {
        assert(!(key in payload), `${key} must not be in the token`);
      }
      assert.equal(result.body.data.token, undefined, 'cookie mode must not expose the token');
    },
  );

  await t.test(
    'tampered, unsigned, confused-algorithm, and foreign tokens are rejected',
    async () => {
      const token = await bearerLogin();
      assert.equal((await me(token)).status, 200);
      const claims = decode(token).payload;
      const now = Math.floor(Date.now() / 1000);
      const parts = token.split('.');
      const withoutJti = { ...claims };
      delete withoutJti.jti;
      const cases: Record<string, string> = {
        'flipped signature': token.slice(0, -2) + (token.endsWith('A') ? 'BB' : 'AA'),
        'payload swapped to another user': `${parts[0]}.${encode({ ...claims, sub: 'admin' })}.${parts[2]}`,
        'alg none': forge(claims, { alg: 'none' }),
        'HS512 with the right secret': forge(claims, { alg: 'HS512' }),
        'HS256 with another secret': forge(claims, {
          secret: 'a-completely-different-secret-value-0123456789',
        }),
        expired: forge({ ...claims, iat: now - 200, exp: now - 100 }),
        'wrong audience': forge({ ...claims, aud: 'someone-else' }),
        'wrong issuer': forge({ ...claims, iss: 'someone-else' }),
        'missing jti': forge(withoutJti),
        'non-integer version': forge({ ...claims, ver: 'x' }),
        garbage: 'not.a.token',
      };
      for (const [name, forged] of Object.entries(cases)) {
        const result = await me(forged);
        assert.equal(result.status, 401, `${name} must be rejected, got ${result.status}`);
      }
      assert.equal(
        (await me(forge(claims))).status,
        200,
        'control: a token signed with the real secret is accepted',
      );
    },
  );

  await t.test('logout revokes the token on the server even when it is replayed', async () => {
    const client = new Client();
    await client.login();
    const stolen = client.cookies.get('sewaskill.token')!;
    assert.equal((await me(stolen)).status, 200);
    await database.revokedToken.create({
      data: { jti: 'expired-old-row', expiresAt: new Date(Date.now() - 1000) },
    });
    const result = await client.mutate('/auth/logout', 'POST');
    assert.equal(result.status, 200);
    assert.equal((await me(stolen)).status, 401, 'replayed token must be rejected after logout');
    assert.equal((await client.send('/auth/me')).status, 401);
    const jti = decode(stolen).payload.jti;
    assert(await database.revokedToken.findUnique({ where: { jti } }), 'jti must be stored');
    assert.equal(
      await database.revokedToken.findUnique({ where: { jti: 'expired-old-row' } }),
      null,
      'expired rows are purged',
    );
  });

  await t.test('raising the account session version invalidates tokens immediately', async () => {
    const client = new Client();
    const user = await client.register('Jwtversion');
    const token = client.cookies.get('sewaskill.token')!;
    assert.equal((await me(token)).status, 200);
    await database.user.update({
      where: { id: user.id },
      data: { sessionVersion: { increment: 1 } },
    });
    assert.equal((await me(token)).status, 401);
  });

  await t.test('bearer mode returns a token only on request and needs no CSRF token', async () => {
    const plain = new Client();
    const plainLogin = await plain.mutate('/auth/login', 'POST', {
      email: 'deva@example.com',
      password: 'demo123',
    });
    assert.equal(plainLogin.body.data.token, undefined);

    const token = await bearerLogin();
    const logout = await new Client().send('/auth/logout', 'POST', undefined, {
      Authorization: `Bearer ${token}`,
    });
    assert.equal(logout.status, 200, JSON.stringify(logout.body));
    assert.equal((await me(token)).status, 401, 'bearer logout revokes the token');
  });

  await t.test('cookie clients still need CSRF, even with a bearer header present', async () => {
    const client = new Client();
    await client.login();
    const token = client.cookies.get('sewaskill.token')!;
    const noCsrf = await client.send('/auth/logout', 'POST');
    assert.equal(noCsrf.status, 403);
    assert.equal(noCsrf.body.error.code, 'CSRF_REJECTED');
    const withBearer = await client.send('/auth/logout', 'POST', undefined, {
      Authorization: `Bearer ${token}`,
    });
    assert.equal(withBearer.status, 403, 'a bearer header must not bypass CSRF for cookie clients');
  });

  await t.test('login errors do not reveal which emails exist', async () => {
    const known: number[] = [];
    const unknown: number[] = [];
    let knownResult: any;
    let unknownResult: any;
    for (let round = 0; round < 5; round++) {
      let started = performance.now();
      knownResult = await new Client().mutate('/auth/login', 'POST', {
        email: 'deva@example.com',
        password: 'wrong-password',
      });
      known.push(performance.now() - started);
      started = performance.now();
      unknownResult = await new Client().mutate('/auth/login', 'POST', {
        email: `nobody${round}@example.com`,
        password: 'wrong-password',
      });
      unknown.push(performance.now() - started);
    }
    assert.equal(knownResult.status, 401);
    assert.equal(unknownResult.status, 401);
    assert.equal(knownResult.body.error.code, unknownResult.body.error.code);
    assert.equal(knownResult.body.error.message, unknownResult.body.error.message);
    assert(
      median(unknown) > median(known) * 0.5,
      `unknown-email logins answer much faster (${median(unknown).toFixed(0)}ms vs ${median(known).toFixed(0)}ms)`,
    );
  });

  await t.test('startup refuses a missing, short, placeholder, or reused JWT_SECRET', async () => {
    const bad = [
      '',
      'short',
      'replace-with-another-random-secret-at-least-32-characters',
      environment.SESSION_SECRET,
    ];
    for (const secret of bad) {
      const child = spawn(process.execPath, ['dist/main.js'], {
        env: { ...environment, PORT: '0', JWT_SECRET: secret },
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      });
      let output = '';
      child.stderr?.on('data', (chunk) => (output += chunk));
      const [code] = await once(child, 'exit');
      assert.notEqual(code, 0, `secret "${secret.slice(0, 12)}" must stop startup`);
      assert.match(output, /JWT_SECRET/);
    }
  });
});

test('upload abuse is rate limited and bad uploads are rejected before any file is stored', async (t) => {
  const client = new Client();
  await client.login();
  await t.test('a request without a file is rejected with a clear message', async () => {
    const result = await client.mutate('/media/images', 'POST');
    assert.equal(result.status, 400);
  });
  await t.test('the upload endpoint answers 429 after the configured limit', async () => {
    let result;
    for (let attempt = 0; attempt < 6; attempt++) {
      result = await client.mutate('/media/images', 'POST');
    }
    assert.equal(result!.status, 429);
    assert.equal(result!.body.error.code, 'RATE_LIMIT');
  });
});
