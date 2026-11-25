import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { chromium } from 'playwright-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const environment = { ...process.env, ...parse(readFileSync(path.join(root, 'backend/.env'))) };
const target = new URL(environment.TEST_DATABASE_URL);
assert(['localhost', '127.0.0.1', '[::1]'].includes(target.hostname));
assert.equal(target.pathname, '/sewaskill_test');
assert.notEqual(environment.TEST_DATABASE_URL, environment.DATABASE_URL);
environment.DATABASE_URL = environment.TEST_DATABASE_URL;
environment.NODE_ENV = 'test';
const database = new PrismaClient({ datasourceUrl: environment.DATABASE_URL });
const processes = [];
const contexts = [];
let browser;

async function port() {
  const socket = createServer();
  await new Promise((resolve) => socket.listen(0, '127.0.0.1', resolve));
  const value = socket.address().port;
  await new Promise((resolve) => socket.close(resolve));
  return value;
}
function start(arguments_, options) {
  const child = spawn(process.execPath, arguments_, {
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
    ...options,
  });
  let output = '';
  for (const stream of [child.stdout, child.stderr])
    stream.on('data', (chunk) => {
      output = (output + chunk).slice(-3000);
    });
  processes.push(child);
  return { child, output: () => output };
}
async function waitFor(url, process) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (process.child.exitCode !== null) throw new Error(process.output());
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Server did not start: ${process.output()}`);
}

try {
  execFileSync(
    process.execPath,
    [path.join(root, 'node_modules/prisma/build/index.js'), 'migrate', 'deploy'],
    { cwd: path.join(root, 'backend'), env: environment, stdio: 'pipe' },
  );
  await database.$executeRawUnsafe(
    'TRUNCATE "BalanceEntry", "ActivityLog", "RecentView", "Favorite", "Review", "Order", "ServicePackage", "Service", "User", "session" CASCADE',
  );
  execFileSync(
    process.execPath,
    [path.join(root, 'node_modules/tsx/dist/cli.mjs'), 'backend/prisma/seed.ts'],
    { cwd: root, env: environment, stdio: 'pipe' },
  );
  const apiPort = await port();
  const frontendPort = await port();
  const origin = `http://127.0.0.1:${frontendPort}`;
  const api = start(['dist/main.js'], {
    cwd: path.join(root, 'backend'),
    env: { ...environment, PORT: String(apiPort), FRONTEND_ORIGIN: origin },
  });
  await waitFor(`http://127.0.0.1:${apiPort}/api/v1/health`, api);
  const frontend = start(
    [
      path.join(root, 'node_modules/vite/bin/vite.js'),
      '--host',
      '127.0.0.1',
      '--port',
      String(frontendPort),
    ],
    {
      cwd: path.join(root, 'frontend'),
      env: { ...process.env, API_PROXY_TARGET: `http://127.0.0.1:${apiPort}` },
    },
  );
  await waitFor(origin, frontend);
  browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const errors = [];
  async function makePage() {
    const context = await browser.newContext({
      viewport: { width: 1366, height: 900 },
      reducedMotion: 'reduce',
    });
    contexts.push(context);
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('dialog', (dialog) => dialog.accept());
    return page;
  }
  async function visit(page, route) {
    await page.goto(origin + route);
    await page.waitForFunction(() => !document.querySelector('.loading-page'));
    assert.equal(await page.locator('main > .notice.error').count(), 0);
  }
  async function login(page, email) {
    await visit(page, '/login');
    await page.locator('#auth-email').fill(email);
    await page.locator('#auth-password').fill('demo123');
    await page.locator('form button[type=submit]').click();
    await page.waitForURL((url) => url.pathname !== '/login');
    await page.waitForFunction(() => !document.querySelector('.loading-page'));
  }
  const buyer = await makePage();
  const seller = await makePage();
  const admin = await makePage();
  await visit(buyer, '/register');
  await buyer.locator('#auth-name').fill('Browser Buyer');
  await buyer.locator('#auth-email').fill('browser-buyer@example.com');
  await buyer.locator('#auth-password').fill('demo123');
  await buyer.locator('#auth-location').fill('Kendari');
  await buyer.locator('form button[type=submit]').click();
  await buyer.waitForURL((url) => url.pathname === '/');
  await login(seller, 'rizky@example.com');
  await login(admin, 'admin@example.com');

  await visit(seller, '/tambah-jasa');
  await seller.locator('#service-title').fill('Browser service');
  await seller
    .locator('#service-description')
    .fill('A complete service created through the browser.');
  await seller.locator('#package-name-0').fill('Standard');
  await seller.locator('#package-price-0').fill('85000');
  await seller.locator('#service-agreement').check();
  await seller.locator('form button[type=submit]').click();
  await seller.waitForURL((url) => url.pathname.startsWith('/detail-jasa/'));
  const serviceId = new URL(seller.url()).pathname.split('/').pop();
  await visit(buyer, '/detail-jasa/' + serviceId);
  await buyer.getByRole('button', { name: /Simpan.*favorit/i }).click();
  await buyer.getByText('Jasa disimpan ke favorit.', { exact: true }).waitFor();
  await buyer.locator('#review-comment').fill('Good service from the browser test.');
  await buyer.locator('#review-form button[type=submit]').click();
  await buyer.getByText('Terima kasih. Ulasanmu berhasil ditambahkan.', { exact: true }).waitFor();
  assert.equal(await database.review.count({ where: { serviceId } }), 1);
  await buyer
    .locator('.review-item')
    .getByText('Good service from the browser test.', { exact: true })
    .waitFor();

  async function orderFlow(accepted) {
    await visit(buyer, '/order?service=' + serviceId);
    await buyer.locator('#buyer-whatsapp').fill('081234567890');
    await buyer.locator('#order-brief').fill('Create a design following this browser test brief.');
    await buyer.locator('form button[type=submit]').click();
    await buyer.waitForURL((url) => url.pathname.startsWith('/pembayaran/'));
    const orderId = new URL(buyer.url()).pathname.split('/').pop();
    await buyer.locator('form button[type=submit]').click();
    await buyer.getByText('Pembayaran demo berhasil.', { exact: false }).waitFor();
    await visit(seller, '/riwayat');
    await seller
      .locator('details.order-entry')
      .filter({ hasText: orderId })
      .locator('summary')
      .click();
    await seller.locator(`#result-${orderId}`).fill('https://example.com/completed-design');
    await seller
      .locator('form')
      .filter({ has: seller.locator(`#result-${orderId}`) })
      .getByRole('button', { name: /Kirim hasil pekerjaan/ })
      .click();
    await seller
      .getByText('Hasil dikirim. Pembeli dapat memeriksa tautan pekerjaan.', { exact: true })
      .waitFor();
    await visit(buyer, '/riwayat');
    const card = buyer.locator('details.order-entry').filter({ hasText: orderId });
    await card.locator('summary').click();
    if (accepted) await card.getByRole('button', { name: 'Terima hasil pekerjaan' }).click();
    else {
      await card.getByRole('button', { name: /Ajukan komplain/ }).click();
      await buyer
        .locator(`#complaint-${orderId}`)
        .fill('The design needs changes before acceptance.');
      await card.getByRole('button', { name: 'Kirim komplain ke admin' }).click();
    }
    await buyer
      .getByText(accepted ? 'Hasil diterima pembeli.' : 'Komplain pembeli sedang ditinjau admin.', {
        exact: false,
      })
      .waitFor();
    await visit(admin, '/admin/pesanan');
    const adminCard = admin.locator('article').filter({ hasText: orderId });
    await adminCard
      .getByRole('button', { name: accepted ? /Setujui/ : /Tolak|Refund|Kembalikan/i })
      .click();
    await admin
      .getByText(accepted ? `Pesanan ${orderId} disetujui.` : `Pesanan ${orderId}`, {
        exact: false,
      })
      .first()
      .waitFor();
    const order = await database.order.findUniqueOrThrow({ where: { id: orderId } });
    assert.equal(order.status, accepted ? 'selesai' : 'direfund');
    console.log(
      JSON.stringify({ flow: accepted ? 'settlement' : 'refund', orderId, status: order.status }),
    );
  }
  await orderFlow(true);
  await orderFlow(false);

  const routes = [
    [buyer, ['/', '/katalog', '/favorit', '/detail-jasa/' + serviceId, '/riwayat', '/profil']],
    [
      seller,
      ['/jasa-saya', '/edit-jasa/' + serviceId, '/dashboard-penyedia', '/riwayat', '/profil'],
    ],
    [admin, ['/admin', '/admin/akun', '/admin/jasa', '/admin/pesanan', '/admin/log']],
  ];
  let routeChecks = 0;
  mkdirSync(path.join(root, 'artifacts'), { recursive: true });
  for (const width of [375, 1366]) {
    for (const [page, paths] of routes) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of paths) {
        await visit(page, route);
        assert(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `Horizontal overflow: ${route} at ${width}`,
        );
        routeChecks++;
      }
    }
    await visit(buyer, '/katalog');
    await buyer.evaluate(async () => {
      const images = [...document.querySelectorAll('img')];
      for (const image of images) image.loading = 'eager';
      await Promise.all(images.map((image) => image.decode().catch(() => {})));
    });
    await buyer.screenshot({
      path: path.join(root, `artifacts/catalog-${width}.png`),
      fullPage: true,
    });
  }
  await buyer.route('**/api/v1/services?*', (route) => route.abort());
  await visit(buyer, '/katalog');
  await buyer.getByRole('alert').filter({ hasText: 'API tidak dapat dihubungi' }).waitFor();
  await buyer.unroute('**/api/v1/services?*');
  await buyer.getByRole('button', { name: 'Coba lagi' }).click();
  await buyer.getByText('jasa ditemukan').waitFor();
  assert.equal(await buyer.evaluate(() => localStorage.getItem('sewaskill-data-v2')), null);
  await buyer.getByRole('button', { name: 'Menu', exact: true }).click();
  await buyer
    .getByRole('button', { name: /Keluar/ })
    .first()
    .click();
  await buyer.getByText('jasa ditemukan').waitFor();
  assert.equal(await buyer.locator('.service-card').count(), 7);
  const guest = await makePage();
  let authChecks = 0;
  for (const width of [375, 767, 768, 1024, 1366]) {
    await guest.setViewportSize({ width, height: 900 });
    for (const route of ['/login', '/register']) {
      await visit(guest, route);
      assert.equal(await guest.getByText('Minimal 6 karakter.', { exact: true }).count(), 0);
      const fields = await guest.locator('form input').evaluateAll((inputs) =>
        inputs.map((input) => {
          const rect = input.getBoundingClientRect();
          return { top: rect.top, height: rect.height };
        }),
      );
      assert(fields.every((field) => field.height === 52));
      if (width >= 768)
        for (let index = 0; index < fields.length; index += 2)
          assert.equal(fields[index].top, fields[index + 1].top);
      authChecks++;
    }
  }
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      browserFlows: 2,
      responsiveRouteChecks: routeChecks,
      authLayoutChecks: authChecks,
      runtimeErrors: errors.length,
      apiFailureRecovery: 'passed',
    }),
  );
} finally {
  for (const context of contexts) await context.close().catch(() => {});
  if (browser) await browser.close();
  for (const child of processes.reverse())
    if (child.exitCode === null) {
      const exited = once(child, 'exit');
      child.kill();
      await exited;
    }
  await database.$disconnect();
}
