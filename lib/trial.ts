export const TRIAL_DAYS = 14;
const DAY_MS = 86_400_000;

/** Orgs created before the trial shipped get a full trial counted from this date instead. */
export const TRIAL_LAUNCH_MS = Date.UTC(2026, 10, 25);

export function trialEndsAt(orgCreatedAt: number, trialStartedAt?: number | null): number {
  const start = trialStartedAt ?? Math.max(orgCreatedAt, TRIAL_LAUNCH_MS);
  return start + TRIAL_DAYS * DAY_MS;
}

export function isTrialActive(endsAt: number, now = Date.now()): boolean {
  return now < endsAt;
}

export function trialDaysLeft(endsAt: number, now = Date.now()): number {
  return Math.max(0, Math.ceil((endsAt - now) / DAY_MS));
}
