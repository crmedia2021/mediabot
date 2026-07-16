import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    const user = (await ctx.db.get(userId as any)) as any;
    return user?.role === "admin" || user?.role === "super_admin";
  },
});

export const isSuperAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    const user = (await ctx.db.get(userId as any)) as any;
    return user?.role === "super_admin";
  },
});

export const getAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = (await ctx.db.get(userId as any)) as any;
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) return null;
    const allUsers = await ctx.db.query("users").collect();
    const allDownloads = await ctx.db.query("downloads").collect();
    const allPayments = await ctx.db.query("payments").collect();
    const allReferrals = await ctx.db.query("referrals").collect();
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const platformCounts: Record<string, number> = {};
    for (const dl of allDownloads) platformCounts[dl.platform] = (platformCounts[dl.platform] ?? 0) + 1;
    const totalRevenue = allPayments.filter((p: any) => p.status === "completed").reduce((sum: number, p: any) => sum + p.amount, 0);
    return {
      totalUsers: allUsers.length, totalDownloads: allDownloads.length, totalRevenue,
      totalCreditsInCirculation: allUsers.reduce((sum: number, u: any) => sum + (u.credits ?? 0), 0),
      freeUsers: allUsers.filter((u: any) => u.mode === "free").length,
      creditUsers: allUsers.filter((u: any) => u.mode === "credit").length,
      totalReferrals: allReferrals.length,
      recentUsers: allUsers.filter((u: any) => (u.firstSeen ?? 0) > oneWeekAgo).length,
      platformCounts,
      adminCount: allUsers.filter((u: any) => u.role === "admin" || u.role === "super_admin").length,
    };
  },
});

export const getAllUsers = query({
  args: { limit: v.optional(v.number()), role: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const user = (await ctx.db.get(userId as any)) as any;
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) return [];
    if (args.role) return await ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", args.role as any)).take(args.limit ?? 50);
    return await ctx.db.query("users").take(args.limit ?? 50);
  },
});

export const adjustUserCredits = mutation({
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
    await ctx.db.insert("activityLogs", { userId: userId as string, action: "Admin credit adjustment", details: `${args.amount > 0 ? "Added" : "Removed"} ${Math.abs(args.amount)} credits from ${targetUser.name ?? targetUser.email ?? args.targetUserId}. Reason: ${args.reason}`, type: "admin_action" });
    return { success: true, newBalance };
  },
});

export const manageUserRole = mutation({
  args: { targetUserId: v.string(), newRole: v.union(v.literal("super_admin"), v.literal("admin"), v.literal("user"), v.literal("member")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const admin = (await ctx.db.get(userId as any)) as any;
    if (!admin || admin.role !== "super_admin") throw new Error("Only super admins can manage roles");
    const targetUser = (await ctx.db.get(args.targetUserId as any)) as any;
    if (!targetUser) throw new Error("Target user not found");
    const oldRole = targetUser.role ?? "user";
    await ctx.db.patch(args.targetUserId as any, { role: args.newRole });
    await ctx.db.insert("activityLogs", { userId: userId as string, action: "Role changed", details: `${targetUser.name ?? targetUser.email}: ${oldRole} → ${args.newRole}`, type: "admin_action" });
    return { success: true };
  },
});

export const getSystemConfig = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = (await ctx.db.get(userId as any)) as any;
    if (!user || user.role !== "super_admin") return null;
    const allUsers = await ctx.db.query("users").collect();
    const allSettings = await ctx.db.query("settings").collect();
    return {
      userCount: allUsers.length, settingsCount: allSettings.length,
      settings: allSettings.map((s: any) => ({ key: s.key, value: s.value, description: s.description })),
      roles: { superAdmin: allUsers.filter((u: any) => u.role === "super_admin").length, admin: allUsers.filter((u: any) => u.role === "admin").length, user: allUsers.filter((u: any) => u.role === "user" || !u.role).length },
    };
  },
});

export const getActivityLogs = query({
  args: { limit: v.optional(v.number()), type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const user = (await ctx.db.get(userId as any)) as any;
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) return [];
    if (args.type) return await ctx.db.query("activityLogs").withIndex("by_type", (q) => q.eq("type", args.type as any)).order("desc").take(args.limit ?? 20);
    return await ctx.db.query("activityLogs").order("desc").take(args.limit ?? 20);
  },
});
