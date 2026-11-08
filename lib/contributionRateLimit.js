const WINDOW_MS = 60_000;
const CLIENT_LIMIT = 30;
const INSTANCE_LIMIT = 120;

export function getContributionClientKey(headers, isVercel) {
  // Other forwarding headers can be supplied by clients or external proxies.
  const address = isVercel ? headers.get('x-vercel-forwarded-for') : null;
  return address?.split(',')[0].trim() || 'unidentified-client';
}

export function createContributionRateLimiter({
  limit = CLIENT_LIMIT,
  totalLimit = INSTANCE_LIMIT,
  windowMs = WINDOW_MS,
  now = Date.now,
} = {}) {
  if (![limit, totalLimit, windowMs].every((value) => Number.isSafeInteger(value) && value > 0)) {
    throw new RangeError('Rate limits and window duration must be positive integers.');
  }

  // This state belongs to one function instance; it is not a distributed limit.
  const clients = new Map();
  const requests = [];

  function removeExpired(timestamps, cutoff) {
    while (timestamps.length > 0 && timestamps[0] <= cutoff) {
      timestamps.shift();
    }
  }

  return (client) => {
    const timestamp = now();
    const cutoff = timestamp - windowMs;
    removeExpired(requests, cutoff);
    clients.forEach((timestamps, key) => {
      removeExpired(timestamps, cutoff);
      if (timestamps.length === 0) clients.delete(key);
    });

    const clientRequests = clients.get(client) ?? [];
    let retryAt = timestamp;
    if (clientRequests.length >= limit) {
      retryAt = Math.max(retryAt, clientRequests[0] + windowMs);
    }
    if (requests.length >= totalLimit) {
      retryAt = Math.max(retryAt, requests[0] + windowMs);
    }
    if (retryAt > timestamp) {
      return { allowed: false, retryAfter: Math.ceil((retryAt - timestamp) / 1_000) };
    }

    // Only admitted requests create entries, so INSTANCE_LIMIT also bounds memory.
    requests.push(timestamp);
    clientRequests.push(timestamp);
    clients.set(client, clientRequests);
    return { allowed: true, retryAfter: 0 };
  };
}
