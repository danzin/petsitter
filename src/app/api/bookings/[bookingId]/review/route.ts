import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/container";
import { ReviewService } from "@/services/ReviewService";
import { getAuthSession } from "@/lib/auth/authContext";

const reviewService = container.resolve(ReviewService);

export async function GET(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const session = await getAuthSession();
    const { bookingId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized: Not logged in" },
        { status: 401 }
      );
    }

    if (!bookingId) {
      return NextResponse.json(
        { message: "Booking ID is required" },
        { status: 400 }
      );
    }

    console.log(
      `[API GET /bookings/${bookingId}/review] Fetching review status for booking ${bookingId} by user ${session.user.id}`
    );

    const review = await reviewService.getReviewByBookingId(bookingId);

    if (review) {
      return NextResponse.json({ hasReviewed: true, review }, { status: 200 });
    } else {
      return NextResponse.json({ hasReviewed: false }, { status: 404 });
    }
  } catch (error: any) {
    console.error(
      `[API GET /bookings/${params?.bookingId}/review] Error:`,
      error
    );
    return NextResponse.json(
      { message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
