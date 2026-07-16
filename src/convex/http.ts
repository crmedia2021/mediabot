import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

/**
 * Stripe Webhook Endpoint
 *
 * Configure your Stripe webhook to point to:
 * {CONVEX_URL}/api/stripe-webhook
 *
 * Events to listen for:
 * - payment_intent.succeeded
 * - checkout.session.completed
 */
http.route({
  path: "/api/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.text();
      const signature = request.headers.get("stripe-signature");

      // In production, verify the webhook signature using Stripe SDK:
      // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      // const event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET!);

      // For now, parse the event directly (add signature verification in production)
      const event = JSON.parse(body);

      switch (event.type) {
        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object;
          await ctx.runMutation(api.payments.handleStripeWebhook, {
            type: "payment_intent.succeeded",
            stripePaymentIntentId: paymentIntent.id,
          });
          break;
        }
        case "checkout.session.completed": {
          const session = event.data.object;
          await ctx.runMutation(api.payments.handleStripeWebhook, {
            type: "checkout.session.completed",
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent,
          });
          break;
        }
        default:
          break;
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response(
        JSON.stringify({ error: "Webhook handler failed" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

export default http;
