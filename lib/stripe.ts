import "server-only";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-11-18.endive",
});

export const PRICES = {
  pro:  process.env.STRIPE_PRO_PRICE_ID!,
  team: process.env.STRIPE_TEAM_PRICE_ID!,
} as const;

export type PlanKey = keyof typeof PRICES;
