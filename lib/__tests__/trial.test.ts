import { describe, it, expect } from "vitest";
import { TRIAL_LAUNCH_MS, isTrialActive, trialDaysLeft, trialEndsAt } from "@/lib/trial";

const DAY = 86_400_000;
const created = TRIAL_LAUNCH_MS + 3 * DAY;

describe("trialEndsAt", () => {
  it("ends 14 days after the org is created", () => {
    expect(trialEndsAt(created)).toBe(created + 14 * DAY);
  });

  it("gives orgs created before launch a full trial from launch day", () => {
    expect(trialEndsAt(TRIAL_LAUNCH_MS - 90 * DAY)).toBe(TRIAL_LAUNCH_MS + 14 * DAY);
  });

  it("uses an explicit trialStartedAt override when present", () => {
    const start = TRIAL_LAUNCH_MS - 30 * DAY;
    expect(trialEndsAt(created, start)).toBe(start + 14 * DAY);
  });
});

describe("isTrialActive", () => {
  const ends = trialEndsAt(created);

  it("is active on day 1 and the last moment of day 14", () => {
    expect(isTrialActive(ends, created)).toBe(true);
    expect(isTrialActive(ends, ends - 1)).toBe(true);
  });

  it("expires exactly at the end and stays expired", () => {
    expect(isTrialActive(ends, ends)).toBe(false);
    expect(isTrialActive(ends, ends + 30 * DAY)).toBe(false);
  });
});

describe("trialDaysLeft", () => {
  const ends = trialEndsAt(created);

  it("counts 14 days at the start", () => {
    expect(trialDaysLeft(ends, created)).toBe(14);
  });

  it("rounds a partial final day up to 1", () => {
    expect(trialDaysLeft(ends, ends - 60_000)).toBe(1);
  });

  it("never goes negative after expiry", () => {
    expect(trialDaysLeft(ends, ends + 5 * DAY)).toBe(0);
  });
});
