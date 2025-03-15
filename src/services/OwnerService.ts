import { injectable, inject } from "tsyringe";
import { OwnerRepository } from "@/repositories/OwnerRepository";
import { PetOwner, Pet, Prisma } from "@prisma/client";
import { InputJsonValue } from "@prisma/client/runtime/library";

interface PetCreateDTO {
  name: string;
  type: string;
  breed?: string;
  age?: number;
  description?: string;
  imageUrl?: string;
}

interface OwnerPreferencesDTO {
  preferredServices?: string[];
  preferredSitterAttributes?: string[];
  notificationPreferences?: any;
}

@injectable()
export class OwnerService {
  constructor(
    @inject("OwnerRepository") private ownerRepository: OwnerRepository,
    @inject("PrismaClient") private prisma: Prisma.TransactionClient
  ) {}

  async getOwnerProfile(userId: string): Promise<PetOwner | null> {
    return this.ownerRepository.findByUserId(userId);
  }

  async createOwnerProfile(
    userId: string,
    preferences?: OwnerPreferencesDTO
  ): Promise<PetOwner> {
    return this.ownerRepository.create({
      user: { connect: { id: userId } },
      preferences: (preferences as InputJsonValue) || ({} as InputJsonValue),
    });
  }

  async updateOwnerPreferences(
    userId: string,
    preferences: OwnerPreferencesDTO
  ): Promise<PetOwner> {
    const owner = await this.ownerRepository.findByUserId(userId);

    if (!owner) {
      throw new Error("Owner profile not found");
    }

    return this.ownerRepository.update(owner.id, {
      preferences: preferences as InputJsonValue | undefined,
    });
  }

  async getPets(userId: string): Promise<Pet[]> {
    const owner = await this.ownerRepository.findByUserId(userId);

    if (!owner) {
      return [];
    }

    return this.ownerRepository.getPets(owner.id);
  }

  async addPet(userId: string, petData: PetCreateDTO): Promise<Pet> {
    const owner = await this.ownerRepository.findByUserId(userId);

    if (!owner) {
      throw new Error("Owner profile not found");
    }

    return this.prisma.pet.create({
      data: {
        ...petData,
        owner: { connect: { id: owner.id } },
      },
    });
  }

  async updatePet(
    petId: string,
    userId: string,
    petData: Partial<PetCreateDTO>
  ): Promise<Pet> {
    const owner = await this.ownerRepository.findByUserId(userId);

    if (!owner) {
      throw new Error("Owner profile not found");
    }

    // Verify pet ownership
    const pet = await this.prisma.pet.findFirst({
      where: {
        id: petId,
        ownerId: owner.id,
      },
    });

    if (!pet) {
      throw new Error(
        "Pet not found or you don't have permission to update it"
      );
    }

    return this.prisma.pet.update({
      where: { id: petId },
      data: petData,
    });
  }

  async deletePet(petId: string, userId: string): Promise<void> {
    const owner = await this.ownerRepository.findByUserId(userId);

    if (!owner) {
      throw new Error("Owner profile not found");
    }

    const pet = await this.prisma.pet.findFirst({
      where: {
        id: petId,
        ownerId: owner.id,
      },
    });

    if (!pet) {
      throw new Error(
        "Pet not found or you don't have permission to delete it"
      );
    }

    await this.prisma.pet.delete({
      where: { id: petId },
    });
  }

  async checkProfileExists(userId: string): Promise<boolean> {
    const profile = await this.ownerRepository.findByUserId(userId);
    return !!profile;
  }
}
