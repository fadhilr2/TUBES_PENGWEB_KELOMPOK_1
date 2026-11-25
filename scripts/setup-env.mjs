import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'backend/.env');
if (existsSync(target)) console.log('backend/.env already exists; no changes made.');
else {
  const example = readFileSync(path.join(root, 'backend/.env.example'), 'utf8');
  writeFileSync(
    target,
    example
      .replace(
        'replace-with-a-random-secret-at-least-32-characters',
        randomBytes(48).toString('hex'),
      )
      .replace(
        'replace-with-another-random-secret-at-least-32-characters',
        randomBytes(48).toString('hex'),
      ),
  );
  console.log(
    'Created backend/.env. Set DATABASE_URL and TEST_DATABASE_URL to your local PostgreSQL credentials.',
  );
}
