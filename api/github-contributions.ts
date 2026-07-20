import {
  createContributionPayload,
  getContributionRange,
  parseContributionYear,
} from '../lib/githubContributions.js';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const USERNAME = 'rice-awa';
const CACHE_CONTROL = 'public, s-maxage=3600, stale-while-revalidate=86400';

const query = `
  query ContributionCalendar($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              color
              contributionCount
              contributionLevel
              date
              weekday
            }
          }
        }
      }
    }
  }
`;

function json(body: unknown, status: number, headers: HeadersInit = {}) {
  return Response.json(body, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
  });
}

function error(code: string, message: string, status: number, headers: HeadersInit = {}) {
  return json({ error: { code, message } }, status, headers);
}

export default async function handler(request: Request) {
  if (request.method !== 'GET') {
    return error('METHOD_NOT_ALLOWED', 'Only GET requests are supported.', 405, { Allow: 'GET' });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return error('SERVER_MISCONFIGURED', 'Contribution data is not configured.', 500);
  }

  const now = new Date();
  const requestedYear = new URL(request.url).searchParams.get('year');
  let year: number;
  try {
    year = parseContributionYear(requestedYear, now);
  } catch {
    return error('INVALID_YEAR', 'Year must be between 2008 and the current year.', 400);
  }

  const range = getContributionRange(year, now);
  let upstream: Response;
  try {
    upstream = await fetch(GITHUB_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'riceawa-portfolio-contributions',
      },
      body: JSON.stringify({
        query,
        variables: { login: USERNAME, from: range.from, to: range.to },
      }),
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    return error('UPSTREAM_UNAVAILABLE', 'Contribution data is temporarily unavailable.', 502);
  }

  if (!upstream.ok) {
    return error('UPSTREAM_UNAVAILABLE', 'Contribution data is temporarily unavailable.', 502);
  }

  let result: {
    data?: { user?: { contributionsCollection?: { contributionCalendar?: unknown } } };
    errors?: unknown[];
  };
  try {
    result = await upstream.json();
  } catch {
    return error('UPSTREAM_INVALID', 'Contribution data is temporarily unavailable.', 502);
  }

  const calendar = result.data?.user?.contributionsCollection?.contributionCalendar;
  if (result.errors || !calendar || typeof calendar !== 'object') {
    return error('UPSTREAM_INVALID', 'Contribution data is temporarily unavailable.', 502);
  }

  return json(
    createContributionPayload({
      username: USERNAME,
      year,
      range,
      calendar,
      generatedAt: now.toISOString(),
    }),
    200,
    { 'Cache-Control': CACHE_CONTROL },
  );
}
