export interface YearRequestCache<T> {
  get(year: number): Promise<T>;
  refresh(year: number): Promise<T>;
}

export function createYearRequestCache<T>(loadYear: (year: number) => Promise<T>): YearRequestCache<T>;
