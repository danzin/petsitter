import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/container";
import { ReviewService } from "@/services/ReviewService";
import { z } from "zod";
import { SitterService } from "@/services/SitterService";

const reviewService = container.resolve(ReviewService);
const sitterService = container.resolve(SitterService);

export async function GET(
  req: NextRequest,
  { params }: { params: { sitterId: string } }
) {
  const { sitterId } = await params;

  if (!sitterId) {
    return NextResponse.json(
      { message: "Sitter ID is required" },
      { status: 400 }
    );
  }

  // Pagination query parameters
  const { searchParams } = new URL(req.url);
  const page = z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .default(1)
    .parse(searchParams.get("page"));
  const limit = z.coerce
    .number()
    .int()
    .positive()
    .max(50)
    .optional()
    .default(5)
    .parse(searchParams.get("limit"));

  try {
    const sitter = await sitterService.getSitterById(sitterId);
    if (!sitter || !sitter.userId) {
      console.warn(
        `Sitter profile or user ID not found for PetSitter ID: ${sitterId}`
      );
      return NextResponse.json({ reviews: [], total: 0, averageRating: null }); // Return empty
    }

    const sitterUserId = sitter.userId;
    console.log(
      `Fetching reviews for Sitter User ID: ${sitterUserId} (derived from PetSitter ID: ${sitterId})`
    );
    const result = await reviewService.getReviewsForSitter(
      sitterUserId,
      page,
      limit
    );
    // result.reviews.forEach(r => r.author.image = makeAbsoluteUrl(r.author.image));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error fetching reviews for sitter ${sitterId}:`, error);
    return NextResponse.json(
      { message: "Failed to fetch reviews." },
      { status: 500 }
    );
  }
}
