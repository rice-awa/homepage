import assert from 'node:assert/strict';
import test from 'node:test';

import { createYearRequestCache } from '../src/hooks/contributionRequestCache.js';
import {
  createContributionPayload,
  getContributionRange,
  parseContributionYear,
} from '../lib/githubContributions.js';

const NOW = new Date('2026-07-20T12:00:00.000Z');

test('uses the current year when no year is provided', () => {
  assert.equal(parseContributionYear(null, NOW), 2026);
  assert.equal(parseContributionYear('2025', NOW), 2025);
});

test('rejects out-of-range and non-numeric contribution years', () => {
  assert.throws(() => parseContributionYear('2007', NOW), RangeError);
  assert.throws(() => parseContributionYear('2027', NOW), RangeError);
  assert.throws(() => parseContributionYear('2025.5', NOW), RangeError);
});

test('uses the inclusive trailing 365 days for the current year', () => {
  assert.deepEqual(getContributionRange(2026, NOW), {
    from: '2025-07-21T00:00:00.000Z',
    to: '2026-07-20T23:59:59.999Z',
  });
});

test('uses a complete UTC calendar year for historical selections', () => {
  assert.deepEqual(getContributionRange(2025, NOW), {
    from: '2025-01-01T00:00:00.000Z',
    to: '2025-12-31T23:59:59.999Z',
  });
});

test('normalizes the GitHub calendar into the public response contract', () => {
  const range = getContributionRange(2025, NOW);
  const payload = createContributionPayload({
    username: 'rice-awa',
    year: 2025,
    range,
    generatedAt: '2026-07-20T12:00:00.000Z',
    calendar: {
      totalContributions: 3,
      weeks: [{
        contributionDays: [{
          date: '2025-01-01',
          contributionCount: 3,
          contributionLevel: 'SECOND_QUARTILE',
          color: '#40c463',
          weekday: 3,
        }],
      }],
    },
  });

  assert.deepEqual(payload, {
    username: 'rice-awa',
    year: 2025,
    range,
    total: 3,
    weeks: [{
      days: [{
        date: '2025-01-01',
        count: 3,
        level: 2,
        color: '#40c463',
        weekday: 3,
      }],
    }],
    generatedAt: '2026-07-20T12:00:00.000Z',
  });
});

test('shares one in-flight request for repeated contribution years', async () => {
  let requests = 0;
  const cache = createYearRequestCache(async (year) => {
    requests += 1;
    return { year };
  });

  const [first, second] = await Promise.all([cache.get(2026), cache.get(2026)]);

  assert.deepEqual(first, { year: 2026 });
  assert.deepEqual(second, { year: 2026 });
  assert.equal(requests, 1);
});
