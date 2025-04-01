import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/stripe";
import { getAuthSession } from "@/lib/auth/authContext";
import { container } from "@/lib/container";
import { BookingService } from "@/services/BookingService";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { BookingWithDetails } from "../../../../types/booking";

const bookingService = container.resolve(BookingService);

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized: Not logged in" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { message: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Get booking details from the database
    const booking = await bookingService.getBookingById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.owner.user.id !== session.user.id) {
      return NextResponse.json(
        { message: "Forbidden: You are not the owner of this booking" },
        { status: 403 }
      );
    }

    if (booking.paymentStatus === PaymentStatus.PAID) {
      return NextResponse.json(
        { message: "Booking already paid" },
        { status: 400 }
      );
    }

    if (booking.status === BookingStatus.CANCELLED) {
      return NextResponse.json(
        { message: "Cannot pay for a cancelled booking" },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      throw new Error("NEXT_PUBLIC_SITE_URL is not set");
    }
    const amountInCents = booking.price.mul(100).toNumber();

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Pet Sitting Booking: ${booking.sitter.user.name}`,
              description: `Booking for ${booking.pets
                .map((p) => p.name)
                .join(
                  ", "
                )} from ${booking.startDate.toLocaleDateString()} to ${booking.endDate.toLocaleDateString()}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // Link Stripe session to the booking using metadata
      metadata: {
        bookingId: booking.id,
        userId: session.user.id,
      },

      // Redirect urls after payment attempt
      success_url: `${siteUrl}/bookings/${bookingId}?payment_status=success`,
      cancel_url: `${siteUrl}/bookings/${bookingId}?payment_status=canceled`,
    });
    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { message: `Checkout session error: ${error.message}` },
      { status: 500 }
    );
  }
}
