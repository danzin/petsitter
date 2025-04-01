import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/stripe";
import { headers } from "next/headers";
import { container } from "@/lib/container";
import { BookingService } from "@/services/BookingService";
import { PrismaClientService } from "@/lib/prisma/prismaClient";
import { BookingStatus, PaymentStatus } from "@prisma/client";

const prisma = container.resolve(PrismaClientService).client;

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  let event: Stripe.Event;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set.");
    return NextResponse.json(
      { message: "Webhook secret not configured." },
      { status: 500 }
    );
  }

  try {
    //Must use req.text() for the raw body for Stripe signature verification
    const bodyText = await req.text();
    const sig = (await headers()).get("stripe-signature");

    if (!sig) {
      console.error("Missing stripe-signature header");
      return NextResponse.json(
        { message: "Missing signature" },
        { status: 400 }
      );
    }

    event = stripe.webhooks.constructEvent(bodyText, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Error verifying webhook signature: ${err.message}`);
    return NextResponse.json(
      { message: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const eventType = event.type;

  console.log(
    `Received Stripe webhook event: ${eventType}, Session ID: ${session.id}`
  );

  if (eventType === "checkout.session.completed") {
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      console.error(
        `Webhook Error: Missing bookingId in metadata for session ${session.id}`
      );

      return NextResponse.json(
        { message: "Missing bookingId in metadata" },
        { status: 200 }
      );
    }

    console.log(
      `Processing checkout.session.completed for Booking ID: ${bookingId}`
    );

    try {
      if (session.payment_status === "paid") {
        console.log(`Payment successful for Booking ID: ${bookingId}`);

        //Using PrismaClientService for now
        const updatedBooking = await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: PaymentStatus.PAID,
            status: BookingStatus.PAID,
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : null,
          },
        });
        console.log(
          `Database updated for Booking ID: ${bookingId}`,
          updatedBooking
        );

        // TODO: Add any post payment logic like sending emails
      } else {
        console.warn(
          `Checkout session completed but payment status is '${session.payment_status}' for Booking ID: ${bookingId}`
        );

        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: PaymentStatus.FAILED,
          },
        });
      }
    } catch (dbError: any) {
      console.error(
        `Webhook DB update error for Booking ID ${bookingId}:`,
        dbError
      );

      return NextResponse.json(
        { message: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }
  }
  // TODO: Handle other event types

  return NextResponse.json({ received: true }, { status: 200 });
}
