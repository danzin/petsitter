import { UserType } from "@prisma/client";

type Availability = {
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
