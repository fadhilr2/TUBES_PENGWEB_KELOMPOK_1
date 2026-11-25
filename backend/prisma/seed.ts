import 'dotenv/config';
import { PrismaClient, Role, AccountStatus, OrderStatus, Prisma } from '@prisma/client';
import { hash } from 'argon2';
import { readFileSync } from 'node:fs';
import path from 'node:path';

export async function seed(database = new PrismaClient()) {
  if (process.env.NODE_ENV === 'production') throw new Error('Demo seed is disabled in production');
  const fixture = JSON.parse(readFileSync(path.join(__dirname, 'fixtures/demo.json'), 'utf8'));
  const hashes = new Map<string, string>();
  for (const user of fixture.users)
    if (!hashes.has(user.password)) hashes.set(user.password, await hash(user.password));
  await database.$transaction(
    async (tx) => {
      if (await tx.user.count()) {
        console.log('Database already contains accounts; seed skipped without changes.');
        return;
      }
      for (const u of fixture.users) {
        await tx.user.create({
          data: {
            id: u.id,
            name: u.name,
            email: u.email.toLowerCase(),
            passwordHash: hashes.get(u.password)!,
            role: u.role as Role,
            status: u.status as AccountStatus,
            location: u.location,
            balance: BigInt(u.balance),
            avatar: u.avatar || '',
            skills: u.skills || '',
            experience: u.experience || '',
            createdAt: new Date(u.createdAt),
          },
        });
        await tx.balanceEntry.create({
          data: {
            userId: u.id,
            amount: BigInt(u.balance),
            kind: 'opening',
            operationKey: `opening:${u.id}`,
          },
        });
      }
      for (const s of fixture.services) {
        const { packages, location, ...data } = s;
        await tx.service.create({
          data: {
            ...data,
            createdAt: new Date(s.createdAt),
            packages: {
              create: packages.map((p: object, position: number) => ({ ...p, position })),
            },
          },
        });
      }
      for (const o of fixture.orders) {
        const data = {
          ...o,
          status: o.status as OrderStatus,
          attachments: o.attachments as Prisma.InputJsonValue,
        };
        for (const key of [
          'createdAt',
          'paymentAttemptAt',
          'paidAt',
          'deliveredAt',
          'reviewedByBuyerAt',
          'closedAt',
        ])
          if (data[key]) data[key] = new Date(data[key]);
        await tx.order.create({ data });
      }
      for (const r of fixture.reviews)
        await tx.review.create({ data: { ...r, createdAt: new Date(r.createdAt) } });
      for (const [userId, ids] of Object.entries(fixture.favorites))
        for (const serviceId of ids as string[])
          await tx.favorite.create({ data: { userId, serviceId } });
      for (const [userId, ids] of Object.entries(fixture.recent))
        for (const [position, serviceId] of (ids as string[]).entries())
          await tx.recentView.create({
            data: { userId, serviceId, viewedAt: new Date(Date.now() - position) },
          });
      for (const row of fixture.logs)
        await tx.activityLog.create({ data: { ...row, createdAt: new Date(row.createdAt) } });
      console.log('Seed created: 7 users, 6 services, 13 packages, 7 orders, 12 reviews.');
    },
    { timeout: 30000, isolationLevel: 'Serializable' },
  );
}

if (require.main === module) {
  const database = new PrismaClient();
  seed(database)
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(() => database.$disconnect());
}
