import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createCheckoutSession = mutation({
  args: { packageId: v.id("creditPackages") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = (await ctx.db.get(userId as any)) as any;
    if (!user) throw new Error("User not found");
    const pkg = (await ctx.db.get(args.packageId)) as any;
    if (!pkg || !pkg.active) throw new Error("Package not found or inactive");
    const paymentId = await ctx.db.insert("payments", { userId: userId as string, amount: pkg.price, currency: pkg.currency, method: "stripe", status: "pending", creditsAwarded: pkg.credits, packageName: pkg.name, packageId: args.packageId as string });
    await ctx.db.insert("activityLogs", { userId: userId as string, action: "Checkout initiated", details: `Package: ${pkg.name} ($${pkg.price} ${pkg.currency})`, type: "purchase", metadata: JSON.stringify({ paymentId, packageId: args.packageId }) });
    return { paymentId, amount: pkg.price, currency: pkg.currency, credits: pkg.credits, packageName: pkg.name, stripePriceId: pkg.stripePriceId };
  },
});

export const confirmPayment = mutation({
  args: { paymentId: v.id("payments"), stripePaymentIntentId: v.optional(v.string()), stripeSessionId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const payment = (await ctx.db.get(args.paymentId)) as any;
    if (!payment) throw new Error("Payment not found");
    if (payment.status === "completed") return { already: true };
    const user = (await ctx.db.get(payment.userId as any)) as any;
    if (!user) throw new Error("User not found");
    await ctx.db.patch(args.paymentId, { status: "completed", stripePaymentIntentId: args.stripePaymentIntentId, stripeSessionId: args.stripeSessionId });
    const newBalance = (user.credits ?? 0) + payment.creditsAwarded;
    await ctx.db.patch(user._id, { credits: newBalance, lastSeen: Date.now() });
    await ctx.db.insert("creditTransactions", { userId: user._id as string, amount: payment.creditsAwarded, type: "purchase", description: `Purchased ${payment.creditsAwarded} credits (${payment.packageName ?? "package"})`, balanceAfter: newBalance, referenceId: args.paymentId as string });
    await ctx.db.insert("activityLogs", { userId: user._id as string, action: "Payment completed", details: `${payment.creditsAwarded} credits added via ${payment.packageName}`, type: "purchase", metadata: JSON.stringify({ paymentId: args.paymentId }) });
    return { success: true, newBalance };
  },
});

export const failPayment = mutation({
  args: { paymentId: v.id("payments"), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) throw new Error("Payment not found");
    await ctx.db.patch(args.paymentId, { status: "failed", metadata: args.reason });
    return { success: true };
  },
});

export const getMyPayments = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db.query("payments").withIndex("by_userId", (q) => q.eq("userId", userId as string)).order("desc").take(args.limit ?? 20);
  },
});

export const getAllPayments = query({
  args: { limit: v.optional(v.number()), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const user = (await ctx.db.get(userId as any)) as any;
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) return [];
    if (args.status) return await ctx.db.query("payments").withIndex("by_status", (q) => q.eq("status", args.status as any)).order("desc").take(args.limit ?? 30);
    return await ctx.db.query("payments").order("desc").take(args.limit ?? 30);
  },
});

export const handleStripeWebhook = mutation({
  args: { type: v.string(), stripePaymentIntentId: v.optional(v.string()), stripeSessionId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.type === "payment_intent.succeeded" && args.stripePaymentIntentId) {
      const payment = await ctx.db.query("payments").withIndex("by_stripePaymentIntentId", (q) => q.eq("stripePaymentIntentId", args.stripePaymentIntentId!)).first();
      if (payment && payment.status === "pending") {
        const user = (await ctx.db.get(payment.userId as any)) as any;
        if (user) {
          await ctx.db.patch(payment._id, { status: "completed" });
          const newBalance = (user.credits ?? 0) + payment.creditsAwarded;
          await ctx.db.patch(user._id, { credits: newBalance, lastSeen: Date.now() });
          await ctx.db.insert("creditTransactions", { userId: user._id as string, amount: payment.creditsAwarded, type: "purchase", description: `Stripe payment confirmed: ${payment.creditsAwarded} credits`, balanceAfter: newBalance, referenceId: payment._id as string });
          return { success: true };
        }
      }
    }
    if (args.type === "checkout.session.completed" && args.stripeSessionId) {
      const payment = await ctx.db.query("payments").withIndex("by_stripeSessionId", (q) => q.eq("stripeSessionId", args.stripeSessionId!)).first();
      if (payment && payment.status === "pending") {
        const user = (await ctx.db.get(payment.userId as any)) as any;
        if (user) {
          await ctx.db.patch(payment._id, { status: "completed" });
          const newBalance = (user.credits ?? 0) + payment.creditsAwarded;
          await ctx.db.patch(user._id, { credits: newBalance, lastSeen: Date.now() });
          await ctx.db.insert("creditTransactions", { userId: user._id as string, amount: payment.creditsAwarded, type: "purchase", description: `Stripe checkout confirmed: ${payment.creditsAwarded} credits`, balanceAfter: newBalance, referenceId: payment._id as string });
          return { success: true };
        }
      }
    }
    return { handled: false };
  },
});
