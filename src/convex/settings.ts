import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT_SETTINGS: Record<string, { value: any; description: string }> = {
  freeModeEnabled: { value: true, description: "Allow all users to use the bot for free" },
  weeklyTopupEnabled: { value: true, description: "Auto-add credits weekly for credit mode users" },
  weeklyTopupAmount: { value: 10, description: "Credits added per weekly top-up" },
  creditRate: { value: 1, description: "Credits cost per download" },
  referralBonus: { value: 5, description: "Credits awarded to referrer" },
  referredBonus: { value: 3, description: "Credits awarded to referred user" },
  youtubeEnabled: { value: true, description: "Enable YouTube downloads" },
  instagramEnabled: { value: true, description: "Enable Instagram downloads" },
  tiktokEnabled: { value: true, description: "Enable TikTok downloads" },
  twitterEnabled: { value: true, description: "Enable Twitter/X downloads" },
  facebookEnabled: { value: true, description: "Enable Facebook downloads" },
  requireGroupMembership: { value: false, description: "Require group/channel membership" },
  requiredGroupIds: { value: [], description: "List of required Telegram group IDs" },
  defaultMode: { value: "free", description: "Default mode for new users" },
  stripePublishableKey: { value: "", description: "Stripe publishable key for client" },
  siteUrl: { value: "", description: "Public site URL for Stripe redirects" },
};

export const initSettings = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("settings").collect();
    const existingKeys = new Set(existing.map((s) => s.key));
    let created = 0;
    for (const [key, { value, description }] of Object.entries(DEFAULT_SETTINGS)) {
      if (!existingKeys.has(key)) { await ctx.db.insert("settings", { key, value, description }); created++; }
    }
    return { created, total: Object.keys(DEFAULT_SETTINGS).length };
  },
});

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("settings").collect();
    const map: Record<string, any> = {};
    for (const row of rows) map[row.key] = row.value;
    return map;
  },
});

export const updateSettings = mutation({
  args: { settings: v.record(v.string(), v.union(v.boolean(), v.number(), v.string(), v.array(v.string()))) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = (await ctx.db.get(userId)) as any;
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) throw new Error("Not authorized");
    for (const [key, value] of Object.entries(args.settings)) {
      const existing = await ctx.db.query("settings").withIndex("by_key", (q) => q.eq("key", key)).first();
      if (existing) await ctx.db.patch(existing._id, { value });
      else await ctx.db.insert("settings", { key, value, description: DEFAULT_SETTINGS[key]?.description ?? "" });
    }
    await ctx.db.insert("activityLogs", { userId: userId as string, action: "Settings updated", details: `Updated: ${Object.keys(args.settings).join(", ")}`, type: "admin_action" });
    return { updated: Object.keys(args.settings).length };
  },
});

export const getCreditPackages = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("creditPackages").withIndex("by_active", (q) => q.eq("active", true)).order("asc").collect();
  },
});

export const initCreditPackages = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("creditPackages").collect();
    if (existing.length > 0) return { already: true };
    const defaults = [
      { name: "Starter", credits: 50, price: 4.99, currency: "USD", badge: "", active: true, sortOrder: 1 },
      { name: "Popular", credits: 150, price: 9.99, currency: "USD", badge: "Best Value", active: true, sortOrder: 2 },
      { name: "Pro", credits: 500, price: 19.99, currency: "USD", badge: "Most Credits", active: true, sortOrder: 3 },
      { name: "Enterprise", credits: 1500, price: 49.99, currency: "USD", badge: "Bulk", active: true, sortOrder: 4 },
    ];
    for (const pkg of defaults) await ctx.db.insert("creditPackages", pkg);
    return { created: defaults.length };
  },
});

export const getSetting = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db.query("settings").withIndex("by_key", (q) => q.eq("key", args.key)).first();
    return row?.value ?? null;
  },
});
