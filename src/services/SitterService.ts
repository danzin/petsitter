import { injectable, inject } from "tsyringe";
import { SitterRepository } from "@/repositories/SitterRepository";
import { PetSitter, Prisma } from "@prisma/client";
import { PetSitterWithUser } from "../../types/utils";

interface SitterProfileUpdateDTO {
  experience?: string;
  rate?: number;
  servicesOffered?: string[];
  availability?: any;
}

interface SitterSearchFilters {
  location?: string;
  services?: string[];
  startDate?: Date;
  endDate?: Date;
  minRate?: number;
  maxRate?: number;
}

@injectable()
export class SitterService {
  constructor(
    @inject("SitterRepository") private sitterRepository: SitterRepository
  ) {}

  async getSitterProfileByUserId(userId: string): Promise<PetSitter | null> {
    return this.sitterRepository.findByUserId(userId);
  }

  async getSitterById(sitterId: string): Promise<PetSitterWithUser | null> {
    return this.sitterRepository.findById(sitterId);
  }

  async createSitterProfile(
    userId: string,
    data: SitterProfileUpdateDTO
  ): Promise<PetSitter> {
    const { rate, ...otherData } = data;

    return this.sitterRepository.create({
      user: { connect: { id: userId } },
      experience: data.experience || "",
      rate: rate ? new Prisma.Decimal(rate) : new Prisma.Decimal(0),
      servicesOffered: data.servicesOffered || [],
      availability: data.availability || null,
    });
  }

  async updateSitterProfile(
    userId: string,
    data: SitterProfileUpdateDTO
  ): Promise<PetSitter> {
    const { rate, ...otherData } = data;
    const updateData: Prisma.PetSitterUpdateInput = {
      ...otherData,
      ...(rate !== undefined && { rate: new Prisma.Decimal(rate) }),
    };

    return this.sitterRepository.update(userId, updateData);
  }

  async findAvailableSitters(
    filters: SitterSearchFilters
  ): Promise<PetSitter[]> {
    return await this.sitterRepository.getAvailableSitters({
      location: filters.location,
      services: filters.services,
      startDate: filters.startDate,
      endDate: filters.endDate,
    });
  }

  async checkProfileExists(userId: string): Promise<boolean> {
    const profile = await this.sitterRepository.findByUserId(userId);
    return !!profile;
  }

  async updateAvailability(
    userId: string,
    availability: any
  ): Promise<PetSitter> {
    return this.sitterRepository.update(userId, { availability });
  }

  async findById(sitterId: string): Promise<PetSitterWithUser | null> {
    return this.sitterRepository.findByUserId(sitterId);
  }
}
