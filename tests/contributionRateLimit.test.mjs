import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createContributionRateLimiter,
  getContributionClientKey,
} from '../lib/contributionRateLimit.js';

test('allows the four calendar requests made on page load', () => {
  const check = createContributionRateLimiter();

  for (let index = 0; index < 4; index += 1) {
    assert.deepEqual(check('visitor'), { allowed: true, retryAfter: 0 });
  }
});

test('limits a client across years and reports when the oldest request expires', () => {
  let now = 0;
  const check = createContributionRateLimiter({ limit: 2, now: () => now });

  assert.equal(check('visitor').allowed, true);
  now = 1_000;
  assert.equal(check('visitor').allowed, true);
  now = 1_500;
  assert.deepEqual(check('visitor'), { allowed: false, retryAfter: 59 });
  assert.equal(check('other-visitor').allowed, true);
  now = 60_000;
  assert.equal(check('visitor').allowed, true);
  assert.deepEqual(check('visitor'), { allowed: false, retryAfter: 1 });
});

test('does not allow a double burst across a fixed minute boundary', () => {
  let now = 59_999;
  const check = createContributionRateLimiter({ limit: 1, now: () => now });

  assert.equal(check('visitor').allowed, true);
  now = 60_000;
  assert.deepEqual(check('visitor'), { allowed: false, retryAfter: 60 });
});

test('caps total requests even when client identities change', () => {
  let now = 0;
  const check = createContributionRateLimiter({ totalLimit: 2, now: () => now });

  assert.equal(check('first').allowed, true);
  assert.equal(check('second').allowed, true);
  assert.deepEqual(check('third'), { allowed: false, retryAfter: 60 });
  now = 60_000;
  assert.equal(check('third').allowed, true);
});

test('rejected requests do not extend the window or exhaust other clients', () => {
  let now = 0;
  const check = createContributionRateLimiter({ limit: 1, totalLimit: 2, now: () => now });

  check('first');
  now = 30_000;
  assert.equal(check('first').allowed, false);
  assert.equal(check('second').allowed, true);
  now = 60_000;
  assert.equal(check('first').allowed, true);
});

test('only uses the Vercel-controlled client address when running on Vercel', () => {
  const headers = new Headers({
    'x-vercel-forwarded-for': '192.0.2.1',
    'x-forwarded-for': '198.51.100.1',
    'cf-connecting-ip': '203.0.113.1',
  });

  assert.equal(getContributionClientKey(headers, true), '192.0.2.1');
  assert.equal(getContributionClientKey(headers, false), 'unidentified-client');
  assert.equal(getContributionClientKey(new Headers(), true), 'unidentified-client');
  assert.equal(
    getContributionClientKey(new Headers({ 'x-forwarded-for': '198.51.100.1' }), true),
    'unidentified-client',
  );
});

test('normalizes proxy whitespace without accepting an arbitrary forwarding chain', () => {
  assert.equal(
    getContributionClientKey(new Headers({ 'x-vercel-forwarded-for': ' 192.0.2.1, 198.51.100.1 ' }), true),
    '192.0.2.1',
  );
});
