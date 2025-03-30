import { PetSitter, UserType } from "@prisma/client";

export type Availability = {
  weekly?: string[];
  scheduleType?: "fixed" | "flexible" | "weekly" | "dates";
  selectedDates?: string[];
  blockedDates?: string[];
};

export interface IUser {
  name: string;
  email?: string;
  image?: string;
  userType: UserType;
}

export type PetSitterWithUser = PetSitter & {
  user: {
    id: string | null;
    name: string | null;
    email: string | null;
    location: string | null;
    bio: string | null;
    image: string | null;
  };
};
