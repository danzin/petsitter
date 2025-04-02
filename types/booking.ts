import {
  Booking,
  BookingStatus,
  Pet,
  PetOwner,
  PetSitter,
  User,
} from "@prisma/client";

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

export type BookingWithDetails =
  | (Booking & {
      owner: PetOwner & { user: Pick<User, "id" | "name" | "email" | "image"> };
      sitter: PetSitter & {
        user: Pick<User, "id" | "name" | "email" | "image">;
      };
      pets: Pet[];
    })
  | null;

export interface BookingDetailsProps {
  booking: BookingWithDetails;
  currentUserRole: "owner" | "sitter" | "none";
}
