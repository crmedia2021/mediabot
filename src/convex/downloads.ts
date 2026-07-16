import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** Detect platform from URL */
function detectPlatform(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("instagram.com")) return "instagram";
  if (lower.includes("tiktok.com")) return "tiktok";
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "twitter";
  if (lower.includes("facebook.com") || lower.includes("fb.watch")) return "facebook";
  return "other";
}

/**
 * Create a download request. Deducts credits if in credit mode.
 */
export const createDownload = mutation({
  args: { url: v.string(), quality: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const platform = detectPlatform(args.url);

    // Check platform is enabled
    const settings = await getSettingsMap(ctx);
    const platformKey = `${platform}Enabled`;
    if (settings[platformKey] === false) {
      throw new Error(`${platform} downloads are currently disabled.`);
    }

    // Check credit rate
    const creditRate = settings.creditRate ?? 1;
    const creditsNeeded = user.mode === "free" ? 0 : creditRate;

    if (user.mode === "credit" && (user.credits ?? 0) < creditsNeeded) {
      throw new Error(`Insufficient credits. You need ${creditsNeeded} credits.`);
    }

    // Deduct credits if in credit mode
    let creditsSpent = 0;
    if (user.mode === "credit" && creditsNeeded > 0) {
      const newBalance = (user.credits ?? 0) - creditsNeeded;
      await ctx.db.patch(userId, {
        credits: newBalance,
        totalCreditsSpent: (user.totalCreditsSpent ?? 0) + creditsNeeded,
        lastSeen: Date.now(),
      });

      await ctx.db.insert("creditTransactions", {
        userId: userId as string,
        amount: -creditsNeeded,
        type: "spend",
        description: `Download from ${platform}`,
        balanceAfter: newBalance,
      });
      creditsSpent = creditsNeeded;
    }

    // Create download record
    const downloadId = await ctx.db.insert("downloads", {
      userId: userId as string,
      url: args.url,
      platform,
      status: "processing",
      creditsSpent,
      quality: args.quality ?? "default",
    });

    // Update user stats
    await ctx.db.patch(userId, {
      totalDownloads: (user.totalDownloads ?? 0) + 1,
      lastSeen: Date.now(),
    });

    // Log activity
    await ctx.db.insert("activityLogs", {
      userId: userId as string,
      action: "Download started",
      details: `Platform: ${platform}, URL: ${args.url.slice(0, 80)}`,
      type: "download",
      metadata: JSON.stringify({ downloadId, platform }),
    });

    return { downloadId, platform, creditsSpent };
  },
});

/**
 * Get current user's download history.
 */
export const getMyDownloads = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("downloads")
      .withIndex("by_userId", (q) => q.eq("userId", userId as string))
      .order("desc")
      .take(args.limit ?? 20);
  },
});

/**
 * Admin: get all downloads across all users.
 */
export const getAllDownloads = query({
  args: { limit: v.optional(v.number()), platform: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      return [];
    }

    if (args.platform) {
      return await ctx.db
        .query("downloads")
        .withIndex("by_platform", (q) => q.eq("platform", args.platform!))
        .order("desc")
        .take(args.limit ?? 30);
    }

    return await ctx.db
      .query("downloads")
      .order("desc")
      .take(args.limit ?? 30);
  },
});

// ─── Helper ─────────────────────────────────────────────────────────────────
async function getSettingsMap(ctx: any): Promise<Record<string, any>> {
  const rows = await ctx.db.query("settings").collect();
  const map: Record<string, any> = {
    youtubeEnabled: true,
    instagramEnabled: true,
    tiktokEnabled: true,
    twitterEnabled: true,
    facebookEnabled: true,
    creditRate: 1,
  };
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}
