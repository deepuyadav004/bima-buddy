import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  numeric,
  date,
  jsonb,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

// ============================================================
// Auth tables (NextAuth v5 Drizzle adapter shape)
// ============================================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }),
  image: text("image"),
  phone: text("phone").unique(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (a) => ({
    compoundKey: primaryKey({
      columns: [a.provider, a.providerAccountId],
    }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// ============================================================
// App tables
// ============================================================

export const cases = pgTable("cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  insurer: text("insurer").notNull(),
  claimAmount: numeric("claim_amount").notNull(),
  rejectionDate: date("rejection_date").notNull(),
  claimType: text("claim_type").notNull(),
  rejectionDocPath: text("rejection_doc_path"),
  policyDocPath: text("policy_doc_path"),
  billsDocPath: text("bills_doc_path"),
  paymentStatus: text("payment_status").default("unpaid").notNull(),
  aiStatus: text("ai_status").default("pending").notNull(),
  verdictJson: jsonb("verdict_json"),
  disputeStatus: text("dispute_status"),
  amountRecovered: numeric("amount_recovered"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ============================================================
// Relations
// ============================================================

export const usersRelations = relations(users, ({ many }) => ({
  cases: many(cases),
  accounts: many(accounts),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const casesRelations = relations(cases, ({ one }) => ({
  user: one(users, { fields: [cases.userId], references: [users.id] }),
}));

// ============================================================
// Types
// ============================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Case = typeof cases.$inferSelect;
export type NewCase = typeof cases.$inferInsert;
