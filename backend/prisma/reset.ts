import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { seed } from './seed';

async function reset() {
  if (process.env.NODE_ENV !== 'development')
    throw new Error('Reset requires NODE_ENV=development');
  const target = new URL(process.env.DATABASE_URL!);
  if (
    !['localhost', '127.0.0.1', '[::1]'].includes(target.hostname) ||
    !['/sewaskill', '/sewaskill_test'].includes(target.pathname)
  )
    throw new Error('Reset requires an explicitly named local SewaSkill database');
  const prompt = createInterface({ input: stdin, output: stdout });
  const confirmation = await prompt.question(
    `Delete all demo data in ${target.hostname}:${target.port || 5432}${target.pathname}? Type RESET ${target.pathname.slice(1)}: `,
  );
  prompt.close();
  if (confirmation !== `RESET ${target.pathname.slice(1)}`) throw new Error('Reset cancelled');
  const database = new PrismaClient();
  try {
    await database.$executeRawUnsafe(
      'TRUNCATE "BalanceEntry", "ActivityLog", "RecentView", "Favorite", "Review", "Order", "ServicePackage", "Service", "User", "session" CASCADE',
    );
    await seed(database);
  } finally {
    await database.$disconnect();
  }
}
reset().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
