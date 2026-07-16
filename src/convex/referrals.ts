import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate a referral code for the current user.
 */
export const generateCode = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    if (user.referralCode) return user.referralCode;

    const code = generateUniqueCode();
    await ctx.db.patch(userId, { referralCode: code });
    return code;
  },
});

/**
 * Apply a referral code. Awards bonuses to both referrer and referred.
 */
export const applyReferralCode = mutation({
  args: { referralCode: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Can't refer yourself
    if (user.referralCode === args.referralCode) {
      throw new Error("Cannot use your own referral code.");
    }

    // Already referred?
    if (user.referredBy) {
      throw new Error("You have already used a referral code.");
    }

    // Find referrer
    const referrer = await ctx.db
      .query("users")
      .withIndex("by_referralCode", (q) => q.eq("referralCode", args.referralCode))
      .first();

    if (!referrer) throw new Error("Invalid referral code.");

    // Check not already referred by someone
    const existingRef = await ctx.db
      .query("referrals")
      .withIndex("by_referredId", (q) => q.eq("referredId", userId as string))
      .first();

    if (existingRef) throw new Error("You have already been referred.");

    // Award referral bonus to referrer
    const settings = await getSettingsMap(ctx);
    const referralBonus = settings.referralBonus ?? 5;
    const referredBonus = settings.referredBonus ?? 3;

    const referrerNewBalance = (referrer.credits ?? 0) + referralBonus;
    await ctx.db.patch(referrer._id, {
      credits: referrerNewBalance,
      lastSeen: Date.now(),
    });

    await ctx.db.insert("creditTransactions", {
      userId: referrer._id as string,
      amount: referralBonus,
      type: "referral_bonus",
      description: `Referral bonus: ${user.name ?? user.email ?? "someone"} joined`,
      balanceAfter: referrerNewBalance,
    });

    // Award referred bonus to new user
    const referredNewBalance = (user.credits ?? 0) + referredBonus;
    await ctx.db.patch(userId, {
      credits: referredNewBalance,
      referredBy: args.referralCode,
      lastSeen: Date.now(),
    });

    await ctx.db.insert("creditTransactions", {
      userId: userId as string,
      amount: referredBonus,
      type: "referral_bonus",
      description: `Welcome bonus for using referral code`,
      balanceAfter: referredNewBalance,
    });

    // Create referral record
    await ctx.db.insert("referrals", {
      referrerId: referrer._id as string,
      referredId: userId as string,
      referralCode: args.referralCode,
      bonusAwarded: true,
      referredBonusAwarded: true,
    });

    await ctx.db.insert("activityLogs", {
      userId: userId as string,
      action: "Referral applied",
      details: `Referred by ${referrer.name ?? "user"}`,
      type: "referral",
    });

    return { success: true, referredBonus };
  },
});

/**
 * Get the current user's referral info.
 */
export const getMyReferrals = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    const referralsList = await ctx.db
      .query("referrals")
      .withIndex("by_referrerId", (q) => q.eq("referrerId", userId as string))
      .collect();

    let totalBonusEarned = 0;
    for (const ref of referralsList) {
      if (ref.bonusAwarded) {
        totalBonusEarned += (await getSettingsMap(ctx)).referralBonus ?? 5;
      }
    }

    return {
      referralCode: user.referralCode,
      totalReferrals: referralsList.length,
      totalBonusEarned,
      referredBy: user.referredBy,
    };
  },
});

/**
 * Admin: get all referrals.
 */
export const getAllReferrals = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) return [];

    return await ctx.db
      .query("referrals")
      .order("desc")
      .take(args.limit ?? 30);
  },
});

function generateUniqueCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function getSettingsMap(ctx: any): Promise<Record<string, any>> {
  const rows = await ctx.db.query("settings").collect();
  const map: Record<string, any> = { referralBonus: 5, referredBonus: 3 };
  for (const row of rows) map[row.key] = row.value;
  return map;
}
