const FIRST_CONTRIBUTION_YEAR = 2008;

const LEVELS = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

function toUtcStart(year, month, day) {
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
}

function toUtcEnd(year, month, day) {
  return new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
}

export function parseContributionYear(rawYear, now = new Date()) {
  const currentYear = now.getUTCFullYear();
  if (rawYear === null || rawYear === undefined || rawYear === '') return currentYear;

  const year = Number(rawYear);
  if (!Number.isInteger(year) || year < FIRST_CONTRIBUTION_YEAR || year > currentYear) {
    throw new RangeError('year must be a valid contribution year');
  }
  return year;
}

export function getContributionRange(year, now = new Date()) {
  const currentYear = now.getUTCFullYear();
  if (year === currentYear) {
    const from = toUtcStart(currentYear, now.getUTCMonth(), now.getUTCDate());
    from.setUTCDate(from.getUTCDate() - 364);
    return {
      from: from.toISOString(),
      to: toUtcEnd(currentYear, now.getUTCMonth(), now.getUTCDate()).toISOString(),
    };
  }

  return {
    from: toUtcStart(year, 0, 1).toISOString(),
    to: toUtcEnd(year, 11, 31).toISOString(),
  };
}

export function createContributionPayload({ username, year, range, calendar, generatedAt }) {
  return {
    username,
    year,
    range,
    total: calendar.totalContributions,
    weeks: calendar.weeks.map(({ contributionDays }) => ({
      days: contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: LEVELS[day.contributionLevel] ?? 0,
        color: day.color,
        weekday: day.weekday,
      })),
    })),
    generatedAt,
  };
}
