import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// ─── Roles ──────────────────────────────────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.SUPER_ADMIN),
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

// ─── Validators (inline for Convex codegen) ─────────────────────────────────
const modeValidator = v.union(v.literal("free"), v.literal("credit"));
const downloadStatusValidator = v.union(
  v.literal("pending"),
  v.literal("processing"),
  v.literal("completed"),
  v.literal("failed"),
);
const paymentStatusValidator = v.union(
  v.literal("pending"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("refunded"),
);
const paymentMethodValidator = v.union(
  v.literal("stripe"),
  v.literal("telegram"),
  v.literal("paypal"),
  v.literal("crypto"),
);
const activityTypeValidator = v.union(
  v.literal("download"),
  v.literal("purchase"),
  v.literal("referral"),
  v.literal("credit_adjust"),
  v.literal("login"),
  v.literal("mode_switch"),
  v.literal("admin_action"),
  v.literal("system"),
);

const schema = defineSchema(
  {
    // ─── Auth Tables (do not remove) ─────────────────────────────────────
    ...authTables,

    // ─── Users ───────────────────────────────────────────────────────────
    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),

      // CRMedia fields
      credits: v.number(),
      mode: modeValidator,
      referralCode: v.optional(v.string()),
      referredBy: v.optional(v.string()),
      stripeCustomerId: v.optional(v.string()),
      telegramId: v.optional(v.string()),
      telegramUsername: v.optional(v.string()),
      language: v.optional(v.string()),
      platform: v.optional(v.string()),
      firstSeen: v.number(),
      lastSeen: v.number(),
      totalDownloads: v.number(),
      totalCreditsSpent: v.number(),
      weeklyTopupLastAt: v.optional(v.number()),
    })
      .index("email", ["email"])
      .index("by_referralCode", ["referralCode"])
      .index("by_stripeCustomerId", ["stripeCustomerId"])
      .index("by_telegramId", ["telegramId"])
      .index("by_role", ["role"]),

    // ─── Credit Packages ─────────────────────────────────────────────────
    creditPackages: defineTable({
      name: v.string(),
      credits: v.number(),
      price: v.number(),
      currency: v.string(),
      badge: v.optional(v.string()),
      stripePriceId: v.optional(v.string()),
      active: v.boolean(),
      sortOrder: v.number(),
    }).index("by_active", ["active"]),

    // ─── Credit Transactions ─────────────────────────────────────────────
    creditTransactions: defineTable({
      userId: v.string(),
      amount: v.number(),
      type: v.union(
        v.literal("spend"),
        v.literal("topup"),
        v.literal("referral_bonus"),
        v.literal("purchase"),
        v.literal("admin_adjustment"),
        v.literal("weekly_topup"),
      ),
      description: v.string(),
      balanceAfter: v.number(),
      referenceId: v.optional(v.string()),
    }).index("by_userId", ["userId"]),

    // ─── Downloads ───────────────────────────────────────────────────────
    downloads: defineTable({
      userId: v.string(),
      url: v.string(),
      platform: v.string(),
      title: v.optional(v.string()),
      thumbnail: v.optional(v.string()),
      status: downloadStatusValidator,
      creditsSpent: v.number(),
      quality: v.optional(v.string()),
      downloadUrl: v.optional(v.string()),
      fileSize: v.optional(v.number()),
      error: v.optional(v.string()),
    })
      .index("by_userId", ["userId"])
      .index("by_status", ["status"])
      .index("by_platform", ["platform"]),

    // ─── Referrals ───────────────────────────────────────────────────────
    referrals: defineTable({
      referrerId: v.string(),
      referredId: v.string(),
      referralCode: v.string(),
      bonusAwarded: v.boolean(),
      referredBonusAwarded: v.boolean(),
    })
      .index("by_referrerId", ["referrerId"])
      .index("by_referredId", ["referredId"])
      .index("by_referralCode", ["referralCode"]),

    // ─── Payments ────────────────────────────────────────────────────────
    payments: defineTable({
      userId: v.string(),
      amount: v.number(),
      currency: v.string(),
      method: paymentMethodValidator,
      status: paymentStatusValidator,
      creditsAwarded: v.number(),
      packageName: v.optional(v.string()),
      packageId: v.optional(v.string()),
      stripePaymentIntentId: v.optional(v.string()),
      stripeSessionId: v.optional(v.string()),
      metadata: v.optional(v.string()),
    })
      .index("by_userId", ["userId"])
      .index("by_stripePaymentIntentId", ["stripePaymentIntentId"])
      .index("by_stripeSessionId", ["stripeSessionId"])
      .index("by_status", ["status"]),

    // ─── Settings ────────────────────────────────────────────────────────
    settings: defineTable({
      key: v.string(),
      value: v.union(
        v.boolean(),
        v.number(),
        v.string(),
        v.array(v.string()),
      ),
      description: v.optional(v.string()),
    }).index("by_key", ["key"]),

    // ─── Activity Logs ───────────────────────────────────────────────────
    activityLogs: defineTable({
      userId: v.optional(v.string()),
      action: v.string(),
      details: v.optional(v.string()),
      type: activityTypeValidator,
      metadata: v.optional(v.string()),
    })
      .index("by_type", ["type"])
      .index("by_userId", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
