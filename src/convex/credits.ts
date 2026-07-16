import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getBalance = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = (await ctx.db.get(userId as any)) as any;
    if (!user) return null;
    return { credits: user.credits ?? 0, mode: user.mode ?? "free", userId: user._id };
  },
});

export const getTransactions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("creditTransactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId as string))
      .order("desc")
      .take(args.limit ?? 20);
  },
});

export const spendCredits = mutation({
  args: { amount: v.number(), description: v.string(), referenceId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = (await ctx.db.get(userId as any)) as any;
    if (!user) throw new Error("User not found");
    if (user.mode === "free") return { spent: 0, balance: user.credits ?? 0 };
    const currentCredits = user.credits ?? 0;
    if (currentCredits < args.amount) throw new Error(`Insufficient credits. You have ${currentCredits}, need ${args.amount}.`);
    const newBalance = currentCredits - args.amount;
    await ctx.db.patch(userId as any, { credits: newBalance, totalCreditsSpent: (user.totalCreditsSpent ?? 0) + args.amount, lastSeen: Date.now() });
    await ctx.db.insert("creditTransactions", { userId: userId as string, amount: -args.amount, type: "spend", description: args.description, balanceAfter: newBalance, referenceId: args.referenceId });
    return { spent: args.amount, balance: newBalance };
  },
});

export const addCredits = mutation({
  args: { userId: v.id("users"), amount: v.number(), type: v.union(v.literal("topup"), v.literal("referral_bonus"), v.literal("purchase"), v.literal("admin_adjustment"), v.literal("weekly_topup")), description: v.string(), referenceId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = (await ctx.db.get(args.userId)) as any;
    if (!user) throw new Error("User not found");
    const newBalance = (user.credits ?? 0) + args.amount;
    await ctx.db.patch(args.userId, { credits: newBalance, lastSeen: Date.now() });
    await ctx.db.insert("creditTransactions", { userId: args.userId as string, amount: args.amount, type: args.type, description: args.description, balanceAfter: newBalance, referenceId: args.referenceId });
    return { balance: newBalance };
  },
});

export const switchMode = mutation({
  args: { mode: v.union(v.literal("free"), v.literal("credit")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(userId as any, { mode: args.mode, lastSeen: Date.now() });
    await ctx.db.insert("activityLogs", { userId: userId as string, action: "Mode switched", details: `Switched to ${args.mode} mode`, type: "mode_switch" });
    return args.mode;
  },
});

export const weeklyTopUp = mutation({
  args: { topupAmount: v.number() },
  handler: async (ctx, args) => {
    const settings = await getSettingsMap(ctx);
    if (!settings.weeklyTopupEnabled) return { topped: 0 };
    const topupAmount = args.topupAmount ?? settings.weeklyTopupAmount;
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const users = await ctx.db.query("users").filter((q) => q.eq(q.field("mode"), "credit")).collect();
    let topped = 0;
    for (const user of users) {
      if (!user.weeklyTopupLastAt || now - user.weeklyTopupLastAt > oneWeek) {
        const newBalance = (user.credits ?? 0) + topupAmount;
        await ctx.db.patch(user._id, { credits: newBalance, weeklyTopupLastAt: now, lastSeen: now });
        await ctx.db.insert("creditTransactions", { userId: user._id as string, amount: topupAmount, type: "weekly_topup", description: "Weekly credit top-up", balanceAfter: newBalance });
        topped++;
      }
    }
    return { topped, totalAmount: topped * topupAmount };
  },
});

export const adminAdjustCredits = mutation({
  args: { targetUserId: v.string(), amount: v.number(), reason: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const admin = (await ctx.db.get(userId as any)) as any;
    if (!admin || (admin.role !== "admin" && admin.role !== "super_admin")) throw new Error("Not authorized");
    const targetUser = (await ctx.db.get(args.targetUserId as any)) as any;
    if (!targetUser) throw new Error("Target user not found");
    const newBalance = (targetUser.credits ?? 0) + args.amount;
    if (newBalance < 0) throw new Error("Cannot reduce credits below 0");
    await ctx.db.patch(args.targetUserId as any, { credits: newBalance, lastSeen: Date.now() });
    await ctx.db.insert("creditTransactions", { userId: args.targetUserId, amount: args.amount, type: "admin_adjustment", description: args.reason, balanceAfter: newBalance });
    await ctx.db.insert("activityLogs", { userId: userId as string, action: "Admin credit adjustment", details: `${args.amount > 0 ? "Added" : "Removed"} ${Math.abs(args.amount)} credits to ${targetUser.name ?? targetUser.email ?? args.targetUserId}. Reason: ${args.reason}`, type: "admin_action" });
    return { balance: newBalance };
  },
});

async function getSettingsMap(ctx: any): Promise<Record<string, any>> {
  const rows = await ctx.db.query("settings").collect();
  const map: Record<string, any> = { freeModeEnabled: true, weeklyTopupEnabled: true, weeklyTopupAmount: 10, creditRate: 1, referralBonus: 5, referredBonus: 3, youtubeEnabled: true, instagramEnabled: true, tiktokEnabled: true, twitterEnabled: true, facebookEnabled: true, requireGroupMembership: false, requiredGroupIds: [] };
  for (const row of rows) map[row.key] = row.value;
  return map;
}
