import { useCallback, useEffect, useState } from 'react';

export interface ContributionDay {
  date: string;
  count: number;
  level: number;
  color: string;
  weekday: number;
}

export interface ContributionCalendar {
  username: string;
  year: number;
  range: { from: string; to: string };
  total: number;
  weeks: Array<{ days: ContributionDay[] }>;
  generatedAt: string;
}

interface ApiError {
  error?: { message?: string };
}

const UNAVAILABLE_MESSAGE = 'Contribution data is temporarily unavailable.';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isContributionDay(value: unknown): value is ContributionDay {
  return isRecord(value)
    && typeof value.date === 'string'
    && typeof value.count === 'number'
    && Number.isInteger(value.count)
    && value.count >= 0
    && typeof value.level === 'number'
    && Number.isInteger(value.level)
    && value.level >= 0
    && value.level <= 4
    && typeof value.color === 'string'
    && typeof value.weekday === 'number'
    && Number.isInteger(value.weekday)
    && value.weekday >= 0
    && value.weekday <= 6;
}

function isContributionCalendar(value: unknown): value is ContributionCalendar {
  return isRecord(value)
    && typeof value.username === 'string'
    && Number.isInteger(value.year)
    && isRecord(value.range)
    && typeof value.range.from === 'string'
    && typeof value.range.to === 'string'
    && typeof value.total === 'number'
    && Number.isInteger(value.total)
    && value.total >= 0
    && Array.isArray(value.weeks)
    && value.weeks.every((week) => isRecord(week)
      && Array.isArray(week.days)
      && week.days.every(isContributionDay))
    && typeof value.generatedAt === 'string';
}

function apiErrorMessage(value: unknown) {
  if (!isRecord(value) || !isRecord(value.error) || typeof value.error.message !== 'string') {
    return UNAVAILABLE_MESSAGE;
  }

  return value.error.message;
}

export function useContributions(year: number) {
  const [retryKey, setRetryKey] = useState(0);
  const [data, setData] = useState<ContributionCalendar | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    setData(null);
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const response = await fetch(`/api/github-contributions?year=${year}`, {
          signal: controller.signal,
        });
        const body: unknown = await response.json();

        if (!response.ok) {
          throw new Error(apiErrorMessage(body));
        }

        if (!isContributionCalendar(body)) {
          throw new Error(UNAVAILABLE_MESSAGE);
        }

        if (body.year !== year) {
          throw new Error(UNAVAILABLE_MESSAGE);
        }

        if (!cancelled) {
          setData(body);
        }
      } catch (reason) {
        if (cancelled || controller.signal.aborted) return;

        setData(null);
        setError(reason instanceof Error ? reason.message : UNAVAILABLE_MESSAGE);
      } finally {
        if (!cancelled && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [year, retryKey]);

  const retry = useCallback(() => setRetryKey((value) => value + 1), []);

  return { data, error, loading, retry };
}
