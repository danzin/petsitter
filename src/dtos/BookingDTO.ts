import { BookingStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
export interface CreateBookingDTO {
  startDate: Date;
  endDate: Date;
  notes?: string;
  petIds: string[];
  ownerId: string;
  sitterId: string;
  status: BookingStatus;
  price: Prisma.Decimal;
}
export interface UpdateBookingDTO {
  status?: BookingStatus;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  petIds?: string[];
}
