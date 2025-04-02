import { injectable, inject } from "tsyringe";
import { ReviewRepository } from "@/repositories/ReviewRepository";
import { BookingRepository } from "@/repositories/BookingRepository";
import { Review, BookingStatus } from "@prisma/client";
import { CreateReviewDTO } from "@/dtos/ReviewDTO";
import { ReviewWithAuthor } from "../../types/review";

@injectable()
export class ReviewService {
  constructor(
    @inject("ReviewRepository") private reviewRepository: ReviewRepository,
    @inject("BookingRepository") private bookingRepository: BookingRepository
  ) {}

  /**
   * Creates a review for a completed booking.
   * Requires authorUserId (from session), bookingId, rating, and comment.
   */
  async createReview(dto: CreateReviewDTO): Promise<Review> {
    const booking = await this.bookingRepository.findById(dto.bookingId);

    if (!booking) {
      throw new Error("Booking not found.");
    }
    if (!booking.owner?.user?.id || !booking.sitter?.user?.id) {
      throw new Error(
        "Booking data is incomplete: missing owner/sitter user info."
      );
    }

    // Only the owner can leave a review
    if (booking.owner.user.id !== dto.authorUserId) {
      throw new Error(
        "Permission denied: Only the booking owner can leave a review."
      );
    }

    // Only review completed bookings
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new Error(
        `Cannot leave review for booking with status: ${booking.status}. Must be COMPLETED.`
      );
    }

    // Only one review per booking
    const alreadyReviewed =
      await this.reviewRepository.existsByAuthorAndBooking(
        dto.authorUserId,
        dto.bookingId
      );
    if (alreadyReviewed) {
      throw new Error("You have already reviewed this booking.");
    }

    return this.reviewRepository.create({
      rating: dto.rating,
      comment: dto.comment,
      authorId: dto.authorUserId, // Owner
      subjectId: booking.sitter.user.id, // Sitter being reviewed
      bookingId: dto.bookingId,
    });
  }

  async getReviewByBookingId(bookingId: string): Promise<Review | null> {
    return this.reviewRepository.findByBookingId(bookingId);
  }

  /**
   * Gets reviews FOR a specific sitter.
   */
  async getReviewsForSitter(
    subjectUserId: string,
    page: number = 1,
    limit: number = 5
  ): Promise<{
    reviews: ReviewWithAuthor[];
    total: number;
    averageRating: number | null;
  }> {
    const offset = (page - 1) * limit;
    const [reviews, total, averageRating] = await Promise.all([
      this.reviewRepository.findBySubjectUserId(subjectUserId, limit, offset),
      this.reviewRepository.countBySubjectUserId(subjectUserId),
      this.reviewRepository.calculateAverageRating(subjectUserId),
    ]);
    return { reviews, total, averageRating };
  }

  /** Fetches the single review associated with a booking */
  async getReviewForBooking(
    bookingId: string
  ): Promise<ReviewWithAuthor | null> {
    return this.reviewRepository.findByBookingId(bookingId);
  }
}
