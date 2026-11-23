import { integer, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const deals = pgTable("deals", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull(),
  address: text("address").notNull().default(""),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const photos = pgTable("photos", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull(),
  dealId: text("deal_id")
    .notNull()
    .references(() => deals.id, { onDelete: "cascade" }),
  room: text("room").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const usageMonthly = pgTable(
  "usage_monthly",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    yearMonth: text("year_month").notNull(),
    lookups: integer("lookups").notNull().default(0),
  },
  (t) => [uniqueIndex("usage_org_month").on(t.orgId, t.yearMonth)],
);
