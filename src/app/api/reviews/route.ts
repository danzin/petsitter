import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/container";
import { ReviewService } from "@/services/ReviewService";
import { getAuthSession } from "@/lib/auth/authContext";
import { z } from "zod";

const reviewService = container.resolve(ReviewService);

const createReviewSchema = z.object({
  bookingId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(), // Comment is optional
});

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // Only owners can create reviews
    if (session.user.userType !== "PETOWNER") {
      return NextResponse.json(
        { message: "Forbidden: Only owners can leave reviews." },
        { status: 403 }
      );
    }

    let validatedData;
    try {
      const body = await req.json();
      validatedData = createReviewSchema.parse(body);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: "Invalid input", errors: error.errors },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

    const reviewData = {
      ...validatedData,
      authorUserId: session.user.id, // Add author ID from session
    };

    const newReview = await reviewService.createReview(reviewData);

    return NextResponse.json(
      { message: "Review submitted successfully!", review: newReview },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Review creation error:", error);
    if (
      error.message.includes("not found") ||
      error.message.includes("Permission denied") ||
      error.message.includes("already reviewed") ||
      error.message.includes("Must be COMPLETED")
    ) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Failed to submit review." },
      { status: 500 }
    );
  }
}
