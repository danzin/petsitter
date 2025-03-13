import { injectable, inject } from "tsyringe";
import { UserRepository } from "../repositories/UserRepository";
import bcrypt from "bcryptjs";
import { User, UserType } from "@prisma/client";

interface LoginDTO {
  email: string;
  password: string;
}

interface RegisterDTO {
  email: string;
  password: string;
  name?: string;
  userType?: UserType;
}

@injectable()
export class AuthService {
  constructor(
    @inject("UserRepository") private userRepository: UserRepository
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

    const isPasswordValid = await bcrypt.compare(password, data.password);
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

    return this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name || null,
      userType: data.userType || "PETOWNER",
    });
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}
