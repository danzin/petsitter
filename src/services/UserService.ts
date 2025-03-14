import { injectable, inject } from "tsyringe";
import { UserRepository } from "@/repositories/UserRepository";
import { User, UserType, Prisma } from "@prisma/client";

@injectable()
export class UserService {
  constructor(
    @inject("UserRepository") private userRepository: UserRepository
  ) {}

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async updateUserProfile(
    id: string,
    data: {
      name?: string;
      bio?: string;
      location?: string;
      image?: string;
    }
  ): Promise<User> {
    return this.userRepository.update(id, data);
  }

  async getFullUserProfile(id: string): Promise<any> {
    return this.userRepository.getFullProfile(id);
  }

  async changeUserType(id: string, userType: UserType): Promise<User> {
    return this.userRepository.update(id, { userType });
  }
}
