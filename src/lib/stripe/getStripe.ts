import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = () => {
  if (!stripePromise) {
    const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publicKey) {
      console.error("Stripe publishable key is not set.");
      return null;
    }
    stripePromise = loadStripe(publicKey);
  }
  return stripePromise;
};

export default getStripe;
