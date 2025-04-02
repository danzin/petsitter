import { Review, User } from "@prisma/client";

export type ReviewWithAuthor = Review & {
  author: Pick<User, 'id' | 'name' | 'image'>;
};