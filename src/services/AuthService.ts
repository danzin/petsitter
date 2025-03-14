// services/AuthService.ts
import { injectable, inject } from "tsyringe";
import { UserRepository } from "../repositories/UserRepository";
import { SitterRepository } from "../repositories/SitterRepository";
import { OwnerRepository } from "../repositories/OwnerRepository";
import bcrypt from "bcryptjs";
import { User, UserType, Prisma } from "@prisma/client";

interface LoginDTO {
  email: string;
  password: string;
}

interface RegisterDTO {
  email: string;
  password: string;
  name?: string;
  userType?: UserType;
  location?: string;
}

@injectable()
export class AuthService {
  constructor(
    @inject("UserRepository") private userRepository: UserRepository,
    @inject("SitterRepository") private sitterRepository: SitterRepository,
    @inject("OwnerRepository") private ownerRepository: OwnerRepository
  ) {}

  async validateCredentials(
    email: string,
    password: string
  ): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.password) {
      return null;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    return user;
  }

  async login(data: LoginDTO): Promise<User> {
    const { email, password } = data;
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password as string
    );
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }
    return user;
  }

  async registerUser(data: RegisterDTO): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create the user
    const user = await this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name || null,
      userType: data.userType || UserType.PETOWNER,
      location: data.location || null,
    });

    // Create corresponding profile based on user type
    if (data.userType === UserType.PETSITTER) {
      await this.sitterRepository.create({
        user: { connect: { id: user.id } },
        experience: "",
        rate: new Prisma.Decimal(0),
        servicesOffered: [],
      });
    } else {
      await this.ownerRepository.create({
        user: { connect: { id: user.id } },
        preferences: {},
      });
    }

    return user;
  }

  async switchUserRole(userId: string, newUserType: UserType): Promise<User> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Update user type
    const updatedUser = await this.userRepository.update(userId, {
      userType: newUserType,
    });

    // Create corresponding profile if it doesn't exist
    if (newUserType === UserType.PETSITTER) {
      const existingSitter = await this.sitterRepository.findByUserId(userId);
      if (!existingSitter) {
        await this.sitterRepository.create({
          user: { connect: { id: userId } },
          experience: "",
          rate: new Prisma.Decimal(0),
          servicesOffered: [],
        });
      }
    } else if (newUserType === UserType.PETOWNER) {
      const existingOwner = await this.ownerRepository.findByUserId(userId);
      if (!existingOwner) {
        await this.ownerRepository.create({
          user: { connect: { id: userId } },
          preferences: {},
        });
      }
    }

    return updatedUser;
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}
