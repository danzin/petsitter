import { PrismaClient, Review } from "@prisma/client";
import { injectable, inject } from "tsyringe";
import { ReviewWithAuthor } from "../../types/review";

@injectable()
export class ReviewRepository {
  constructor(@inject("PrismaClient") private prismaClient: PrismaClient) {}

  async create(data: {
    rating: number;
    comment?: string;
    authorId: string;
    subjectId: string;
    bookingId: string;
  }): Promise<Review> {
    return this.prismaClient.review.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        authorId: data.authorId,
        subjectId: data.subjectId,
        bookingId: data.bookingId,
      },
    });
  }

  /**
   * Finds reviews FOR a specific subject (e.g., Pet Sitter) identified by their User ID.
   * Includes author's basic details.
   */
  async findBySubjectUserId(
    subjectUserId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<ReviewWithAuthor[]> {
    return this.prismaClient.review.findMany({
      where: { subjectId: subjectUserId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  /** Counts total reviews for a subject */
  async countBySubjectUserId(subjectUserId: string): Promise<number> {
    return this.prismaClient.review.count({
      where: { subjectId: subjectUserId },
    });
  }

  /** Calculates average rating for a subject */
  async calculateAverageRating(subjectUserId: string): Promise<number | null> {
    const result = await this.prismaClient.review.aggregate({
      _avg: { rating: true },
      where: { subjectId: subjectUserId },
    });
    return result._avg.rating; // Returns null of no reviews found
  }

  /** Checks if a review exists for a specific booking by a specific author */
  async existsByAuthorAndBooking(
    authorId: string,
    bookingId: string
  ): Promise<boolean> {
    const count = await this.prismaClient.review.count({
      where: {
        authorId: authorId,
        bookingId: bookingId,
      },
    });
    return count > 0;
  }

  /** Finds a review by booking ID */
  async findByBookingId(bookingId: string): Promise<ReviewWithAuthor | null> {
    return this.prismaClient.review.findFirst({
      where: { bookingId: bookingId },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });
  }
}
