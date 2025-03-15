import { DefaultSession } from "next-auth";
import { UserType } from "@prisma/client";

declare module "next-auth" {
  // extend the session
  interface Session {
    user: {
      id: string; // match the prisma user.id
      userType: UserType; // make use of the userType enum
    } & DefaultSession["user"]; // include default props (name, email, image)
  }

  // extend the user type providers
  interface User {
    id: string;
    userType: UserType;
  }
}

// extend the jwt type from the token obj
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    userType: UserType; // use the imported prisma UserType
  }
}
