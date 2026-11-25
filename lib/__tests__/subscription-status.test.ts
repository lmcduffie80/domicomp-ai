import { describe, expect, it } from "vitest";
import { subscriptionStatus } from "@/lib/subscription-status";
import { TRIAL_DAYS, TRIAL_LAUNCH_MS } from "@/lib/trial";

const DAY = 86_400_000;
const created = TRIAL_LAUNCH_MS + DAY;
const duringTrial = created + DAY;
const afterTrial = created + (TRIAL_DAYS + 1) * DAY;

describe("subscriptionStatus", () => {
  it("treats comped and founder orgs as founder", () => {
    expect(subscriptionStatus({ comped: true }, created, afterTrial).status).toBe("founder");
    expect(subscriptionStatus({ founder: true, stripeStatus: "canceled" }, created, afterTrial).status).toBe("founder");
  });

  it("reports active Stripe plans", () => {
    expect(subscriptionStatus({ stripePlan: "pro", stripeStatus: "active" }, created, afterTrial).status).toBe("pro");
    expect(subscriptionStatus({ stripePlan: "team", stripeStatus: "trialing" }, created, afterTrial).status).toBe("team");
  });

  it("flags past-due subscriptions", () => {
    expect(subscriptionStatus({ stripePlan: null, stripeStatus: "past_due" }, created, afterTrial).status).toBe("past_due");
  });

  it("distinguishes trial, canceled, and expired orgs", () => {
    expect(subscriptionStatus({}, created, duringTrial).status).toBe("trial");
    expect(subscriptionStatus({ stripeStatus: "canceled" }, created, afterTrial).status).toBe("canceled");
    expect(subscriptionStatus({}, created, afterTrial).status).toBe("expired");
  });

  it("returns when the trial ends", () => {
    expect(subscriptionStatus({}, created).trialEndsAt).toBe(created + TRIAL_DAYS * DAY);
  });
});
