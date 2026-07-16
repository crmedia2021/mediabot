import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get current user profile with CRMedia fields.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const getCurrentUser = async (ctx: any) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return null;
  return await ctx.db.get(userId);
};

/**
 * Ensure the user has a CRMedia profile row. Called after first login.
 */
export const ensureProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(userId);
    if (!existing) throw new Error("User not found in auth table");

    if (existing.credits !== undefined) return existing._id;

    const code = generateReferralCode();

    await ctx.db.patch(userId, {
      credits: 10,
      mode: "free",
      referralCode: code,
      language: "en",
      platform: "web",
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      totalDownloads: 0,
      totalCreditsSpent: 0,
      role: existing.role ?? ("user" as const),
    });

    await ctx.db.insert("activityLogs", {
      userId: userId as string,
      action: "User registered",
      details: `New user joined: ${existing.name ?? existing.email ?? "Anonymous"}`,
      type: "login",
    });

    return userId;
  },
});

/**
 * Get full profile for the current user.
 */
export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

/**
 * Update user profile fields.
 */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const patch: Record<string, any> = { lastSeen: Date.now() };
    if (args.name !== undefined) patch.name = args.name;
    if (args.language !== undefined) patch.language = args.language;

    await ctx.db.patch(userId, patch);
    return userId;
  },
});

/**
 * Link a Telegram account to the user's profile.
 */
export const linkTelegram = mutation({
  args: {
    telegramId: v.string(),
    telegramUsername: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(userId, {
      telegramId: args.telegramId,
      telegramUsername: args.telegramUsername,
      lastSeen: Date.now(),
    });

    await ctx.db.insert("activityLogs", {
      userId: userId as string,
      action: "Telegram linked",
      details: `Linked Telegram: @${args.telegramUsername ?? args.telegramId}`,
      type: "system",
    });

    return userId;
  },
});

/**
 * Update lastSeen timestamp.
 */
export const touchLastSeen = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;
    await ctx.db.patch(userId, { lastSeen: Date.now() });
  },
});

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
