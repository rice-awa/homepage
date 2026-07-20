export function createYearRequestCache(loadYear) {
  const requests = new Map();

  const get = (year) => {
    const existing = requests.get(year);
    if (existing) return existing;

    const request = Promise.resolve()
      .then(() => loadYear(year))
      .catch((error) => {
        requests.delete(year);
        throw error;
      });

    requests.set(year, request);
    return request;
  };

  return {
    get,
    refresh(year) {
      requests.delete(year);
      return get(year);
    },
  };
}
