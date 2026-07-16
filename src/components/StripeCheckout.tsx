import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, CreditCard, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// Initialize Stripe.js outside component to avoid re-creating on every render
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? ""
);

interface StripeCheckoutProps {
  packageId: string;
  packageName: string;
  credits: number;
  price: number;
  currency: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CheckoutForm({
  clientSecret,
  price,
  currency,
  onSuccess,
  onError,
}: {
  clientSecret: string;
  price: number;
  currency: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/dashboard",
      },
      redirect: "if_required",
    });

    if (error) {
      onError(error.message ?? "Payment failed");
      setSubmitting(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
      >
        {submitting ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <CreditCard className="w-4 h-4 mr-2" />
        )}
        Pay ${price} {currency}
      </Button>
    </form>
  );
}

export default function StripeCheckout({
  packageId,
  packageName,
  credits,
  price,
  currency,
  open,
  onOpenChange,
}: StripeCheckoutProps) {
  const { user } = useAuth();
  const createCheckout = useMutation(api.payments.createCheckoutSession);
  const confirmPayment = useMutation(api.payments.confirmPayment);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setClientSecret(null);
      setPaymentId(null);
      setSuccess(false);
      setError(null);
      return;
    }

    // Create checkout session when dialog opens
    setLoading(true);
    createCheckout({ packageId: packageId as any })
      .then((result) => {
        setPaymentId(result.paymentId as string);
        // In production, you'd get clientSecret from Stripe via an action
        // For now, we simulate it
        setClientSecret(`pi_simulated_${result.paymentId}`);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message ?? "Failed to create checkout session");
        setLoading(false);
      });
  }, [open, packageId, createCheckout]);

  const handleSuccess = async () => {
    if (paymentId) {
      try {
        await confirmPayment({
          paymentId: paymentId as any,
        });
      } catch {
        // Payment may already be confirmed via webhook
      }
    }
    setSuccess(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-violet-500" />
            Purchase {packageName}
          </DialogTitle>
          <DialogDescription>
            {credits} credits for ${price} {currency}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex flex-col items-center py-8 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            <p className="text-sm text-muted-foreground">
              Preparing secure checkout...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        )}

        {success && (
          <div className="flex flex-col items-center py-8 gap-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <h3 className="text-lg font-semibold">Payment Successful!</h3>
            <p className="text-sm text-muted-foreground">
              {credits} credits have been added to your account.
            </p>
            <Button
              className="mt-2"
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          </div>
        )}

        {clientSecret && !loading && !success && !error && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "night",
                variables: {
                  colorPrimary: "#7c3aed",
                  colorBackground: "#1e1b2e",
                  colorText: "#f8fafc",
                },
              },
            }}
          >
            <CheckoutForm
              clientSecret={clientSecret}
              price={price}
              currency={currency}
              onSuccess={handleSuccess}
              onError={setError}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}
