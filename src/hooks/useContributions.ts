import { useCallback, useEffect, useState } from 'react';
import { createYearRequestCache } from './contributionRequestCache.js';

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

async function fetchContributionCalendar(year: number): Promise<ContributionCalendar> {
  const response = await fetch(`/api/github-contributions?year=${year}`);
  const body: unknown = await response.json();

  if (!response.ok) {
    throw new Error(apiErrorMessage(body));
  }

  if (!isContributionCalendar(body) || body.year !== year) {
    throw new Error(UNAVAILABLE_MESSAGE);
  }

  return body;
}

const contributionRequests = createYearRequestCache(fetchContributionCalendar);

type CalendarByYear = Partial<Record<number, ContributionCalendar>>;
type ErrorByYear = Partial<Record<number, string>>;

export function useContributions(years: number[], selectedYear: number) {
  const [retryRequest, setRetryRequest] = useState<{ year: number; key: number } | null>(null);
  const [calendars, setCalendars] = useState<CalendarByYear>({});
  const [errors, setErrors] = useState<ErrorByYear>({});
  const [pendingYears, setPendingYears] = useState<Set<number>>(() => new Set(years));
  const yearsKey = years.join(',');

  useEffect(() => {
    let cancelled = false;
    const yearsToLoad = retryRequest ? [retryRequest.year] : years;

    setPendingYears((current) => {
      const next = new Set(current);
      yearsToLoad.forEach((year) => next.add(year));
      return next;
    });

    yearsToLoad.forEach((year) => {
      const request = retryRequest ? contributionRequests.refresh(year) : contributionRequests.get(year);

      void request
        .then((calendar) => {
          if (cancelled) return;

          setCalendars((current) => ({ ...current, [year]: calendar }));
          setErrors((current) => {
            if (!current[year]) return current;
            const next = { ...current };
            delete next[year];
            return next;
          });
        })
        .catch((reason) => {
          if (cancelled) return;

          setErrors((current) => ({
            ...current,
            [year]: reason instanceof Error ? reason.message : UNAVAILABLE_MESSAGE,
          }));
        })
        .finally(() => {
          if (!cancelled) {
            setPendingYears((current) => {
              if (!current.has(year)) return current;
              const next = new Set(current);
              next.delete(year);
              return next;
            });
          }
        });
    });

    return () => {
      cancelled = true;
    };
  }, [retryRequest, yearsKey]);

  const retry = useCallback(() => {
    setErrors((current) => {
      if (!current[selectedYear]) return current;
      const next = { ...current };
      delete next[selectedYear];
      return next;
    });
    setRetryRequest((current) => ({
      year: selectedYear,
      key: (current?.key ?? 0) + 1,
    }));
  }, [selectedYear]);

  const data = calendars[selectedYear] ?? null;
  const error = errors[selectedYear] ?? null;
  const loading = pendingYears.has(selectedYear);

  return { data, error, loading, retry };
}
