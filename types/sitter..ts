import { PetSitter, User } from "@prisma/client";
import { ReviewWithAuthor } from "./review";

export type SitterProfileData = PetSitter & {
  user: Pick<User, "id" | "name" | "email" | "image" | "location" | "bio">;
};

export type SitterProfilePageData = SitterProfileData & {
  reviewsResult: {
    reviews: ReviewWithAuthor[];
    total: number;
    averageRating: number | null;
  };
};
