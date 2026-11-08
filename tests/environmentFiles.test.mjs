import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

test('ignores environment secrets while allowing the example template', () => {
  const files = [
    '.env',
    '.env.local',
    '.env.production',
    '.env.development',
    '.env.production.local',
    '.env.test',
    'nested/.env.production',
    '.env.example',
  ];
  const ignored = execFileSync('git', ['check-ignore', '--no-index', '--', ...files], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8',
  }).trim().split('\n');

  assert.deepEqual(ignored, files.slice(0, -1));
});
