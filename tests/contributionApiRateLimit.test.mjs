import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';

test('the real API handler rejects excess traffic before calling GitHub', async () => {
  const originalFetch = globalThis.fetch;
  const originalToken = process.env.GITHUB_TOKEN;
  const originalVercel = process.env.VERCEL;
  const server = await createServer({
    configFile: false,
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true },
    appType: 'custom',
  });

  try {
    process.env.GITHUB_TOKEN = 'nonsecret-rate-limit-test';
    process.env.VERCEL = '1';
    let upstreamCalls = 0;
    globalThis.fetch = async () => {
      upstreamCalls += 1;
      return Response.json({
        data: {
          user: {
            contributionsCollection: {
              contributionCalendar: { totalContributions: 0, weeks: [] },
            },
          },
        },
      });
    };

    const { GET } = await server.ssrLoadModule('/api/github-contributions.ts');
    const request = (client, year = 2025, extraHeaders = {}) => new Request(
      `http://localhost/api/github-contributions?year=${year}`,
      { headers: { 'x-vercel-forwarded-for': client, ...extraHeaders } },
    );

    assert.equal((await GET(request('192.0.2.1', 2007))).status, 400);
    assert.equal(upstreamCalls, 0);

    // Concurrent requests for different years share the same client limit.
    const responses = await Promise.all(Array.from({ length: 30 }, (_, index) => (
      GET(request('192.0.2.1', 2025 - (index % 4)))
    )));
    for (const response of responses) {
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('Cache-Control'), 'public, s-maxage=3600, stale-while-revalidate=86400');
    }

    const blocked = await GET(request('192.0.2.1', 2024, {
      'x-forwarded-for': '198.51.100.1',
      'cf-connecting-ip': '203.0.113.1',
    }));
    assert.equal(blocked.status, 429);
    assert.equal(blocked.headers.get('Cache-Control'), 'no-store');
    const retryAfter = Number(blocked.headers.get('Retry-After'));
    assert.ok(Number.isInteger(retryAfter) && retryAfter >= 1 && retryAfter <= 60);
    assert.deepEqual(await blocked.json(), {
      error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' },
    });
    assert.equal(upstreamCalls, 30);

    // Changing client identities cannot exceed the instance-wide upstream budget.
    for (let index = 0; index < 90; index += 1) {
      assert.equal((await GET(request(`198.51.100.${index + 1}`))).status, 200);
    }
    assert.equal((await GET(request('203.0.113.1'))).status, 429);
    assert.equal(upstreamCalls, 120);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.GITHUB_TOKEN;
    else process.env.GITHUB_TOKEN = originalToken;
    if (originalVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = originalVercel;
    await server.close();
  }
});
