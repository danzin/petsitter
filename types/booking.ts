import { BookingStatus } from "@prisma/client";

export interface BookingCreateInput {
  startDate: Date;
  endDate: Date;
  petId: string;
  ownerId: string;
  sitterId: string;
  totalPrice?: number;
  notes?: string;
  status?: BookingStatus;
}
