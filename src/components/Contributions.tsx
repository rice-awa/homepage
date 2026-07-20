import { useMemo, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { ACTIVITY } from '../constants/content';
import { type ContributionDay, useContributions } from '../hooks/useContributions';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const WEEKDAYS = ['', 'MON', '', 'WED', '', 'FRI', ''];

function yearsFor(now = new Date()) {
  const currentYear = now.getUTCFullYear();
  return Array.from({ length: 4 }, (_, index) => currentYear - index);
}

function dayLabel(day: ContributionDay) {
  const noun = day.count === 1 ? 'contribution' : 'contributions';
  return `${day.count} ${noun} on ${day.date}`;
}

function MonthLabels({ weeks }: { weeks: Array<{ days: ContributionDay[] }> }) {
  let previousMonth = -1;

  return (
    <div className="activity-months" aria-hidden="true">
      {weeks.map((week, index) => {
        const day = week.days[0];
        if (!day) return <span key={index} />;

        const month = Number(day.date.slice(5, 7)) - 1;
        const showMonth = month !== previousMonth;
        previousMonth = month;

        return <span key={`${day.date}-${index}`}>{showMonth ? MONTHS[month] : ''}</span>;
      })}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="activity-skeleton" aria-label={ACTIVITY.loadingLabel} role="status">
      {Array.from({ length: 371 }, (_, index) => <i key={index} />)}
    </div>
  );
}

export default function Contributions() {
  const years = useMemo(() => yearsFor(), []);
  const [selectedYear, setSelectedYear] = useState(years[0]);
  const [activeDay, setActiveDay] = useState<ContributionDay | null>(null);
  const { data, error, loading, retry } = useContributions(selectedYear);
  const calendar = data?.year === selectedYear ? data : null;
  const weeks = calendar?.weeks || [];
  const isCurrentYear = selectedYear === years[0];

  const selectYear = (year: number) => {
    setActiveDay(null);
    setSelectedYear(year);
  };

  const handleYearKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keyToIndex: Record<string, number> = {
      ArrowDown: (index + 1) % years.length,
      ArrowRight: (index + 1) % years.length,
      ArrowUp: (index - 1 + years.length) % years.length,
      ArrowLeft: (index - 1 + years.length) % years.length,
      Home: 0,
      End: years.length - 1,
    };
    const nextIndex = keyToIndex[event.key];

    if (nextIndex === undefined) return;

    event.preventDefault();
    selectYear(years[nextIndex]);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]
      ?.focus();
  };

  return (
    <section className="activity section" id="activity" aria-labelledby="activity-title">
      <div className="sec-tag">
        ( {ACTIVITY.tag.num} ) — <em>{ACTIVITY.tag.en}</em> {ACTIVITY.tag.cn}
      </div>

      <div className="activity-heading">
        <div>
          <p className="activity-kicker">{ACTIVITY.calendarLabel}</p>
          <h2 id="activity-title">
            {loading || !calendar ? '--' : calendar.total.toLocaleString('en-US')} <span>{ACTIVITY.totalLabel}</span>
          </h2>
        </div>
        <p className="activity-range">{isCurrentYear ? ACTIVITY.rollingLabel : String(selectedYear)}</p>
      </div>

      <div className="activity-layout">
        <div className="activity-surface">
          {loading && (
            <div className="activity-scroll">
              <Skeleton />
            </div>
          )}
          {error && (
            <div className="activity-error" role="alert">
              <p>{ACTIVITY.unavailableLabel}</p>
              <button type="button" onClick={retry}>{ACTIVITY.retryLabel}</button>
            </div>
          )}
          {calendar && (
            <div className="activity-scroll">
              <div className="activity-calendar" id="activity-calendar" role="group" aria-label={`${selectedYear} contribution calendar`}>
                <div className="activity-weekdays" aria-hidden="true">
                  {WEEKDAYS.map((label, index) => <span key={index}>{label}</span>)}
                </div>
                <div>
                  <MonthLabels weeks={weeks} />
                  <div className="activity-grid">
                    {weeks.flatMap((week) => week.days).map((day) => (
                      <button
                        aria-label={dayLabel(day)}
                        className={`activity-day level-${day.level}`}
                        key={day.date}
                        onBlur={() => setActiveDay(null)}
                        onFocus={() => setActiveDay(day)}
                        onMouseEnter={() => setActiveDay(day)}
                        onMouseLeave={() => setActiveDay(null)}
                        style={{ '--activity-row': day.weekday + 1 } as CSSProperties}
                        type="button"
                      />
                    ))}
                  </div>
                </div>
              </div>
              {activeDay && <p className="activity-tooltip" role="status">{dayLabel(activeDay)}</p>}
            </div>
          )}
          <div className="activity-legend" aria-label="Contribution intensity legend">
            <span>{ACTIVITY.lessLabel}</span>
            {[0, 1, 2, 3, 4].map((level) => <i className={`level-${level}`} key={level} />)}
            <span>{ACTIVITY.moreLabel}</span>
          </div>
        </div>

        <div className="activity-years" role="tablist" aria-label="Contribution year">
          {years.map((year, index) => (
            <button
              aria-controls="activity-calendar"
              aria-selected={year === selectedYear}
              key={year}
              onClick={() => selectYear(year)}
              onKeyDown={(event) => handleYearKeyDown(event, index)}
              role="tab"
              tabIndex={year === selectedYear ? 0 : -1}
              type="button"
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      <a className="activity-profile-link" data-cursor="link" href={`https://github.com/${ACTIVITY.username}`} rel="noreferrer" target="_blank">
        @{ACTIVITY.username} ON GITHUB
      </a>
    </section>
  );
}
