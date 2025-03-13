import { BookingStatus } from "@prisma/client";

export interface CreateBookingDTO {
  startDate: Date;
  endDate: Date;
  notes?: string;
  petId: string;
  ownerId: string;
  sitterId: string;
}

export interface UpdateBookingDTO {
  bookingId: string;
  status?: BookingStatus;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
}
