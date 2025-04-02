export interface CreateReviewDTO {
  bookingId: string;
  authorUserId: string;
  rating: number;
  comment?: string;
}
