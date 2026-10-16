export type FinanceTourOutcome = 'completed' | 'skipped';

/** How long a finished tour stays finished; then it shows again (new features). */
export const FINANCE_TOUR_TTL_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

/** When an outcome saved at `now` stops counting. */
export const tourExpiry = (now: Date): Date =>
  new Date(now.getTime() + FINANCE_TOUR_TTL_DAYS * DAY_MS);

/** The saved outcome while still valid at `now`; `null` = the tour is due. */
export const validOutcome = (
  row: { outcome: string; expires_at: string } | null,
  now: Date,
): FinanceTourOutcome | null => {
  if (!row || new Date(row.expires_at).getTime() <= now.getTime()) return null;
  return row.outcome === 'completed' || row.outcome === 'skipped'
    ? row.outcome
    : null;
};
