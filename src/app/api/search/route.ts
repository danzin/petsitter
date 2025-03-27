import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/container";
import { SitterService } from "@/services/SitterService";
import { Decimal } from "@prisma/client/runtime/library";
import { PetSitter } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const sitterService = container.resolve(SitterService);
    const filters = await request.json();
    console.log(filters.location);
    // Always need location
    if (!filters.location) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }

    // Get sitters based on basic criteria
    const sitters = await sitterService.findAvailableSitters({
      location: filters.location,
      services: filters.services || [],
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    });

    // Apply additional filters
    let filteredSitters = [...sitters];

    if (filters.maxPrice) {
      const maxPrice = new Decimal(filters.maxPrice);
      filteredSitters = filteredSitters.filter((sitter) =>
        sitter.rate.lessThanOrEqualTo(maxPrice)
      );
    }

    // Sorting
    if (filters.sort) {
      switch (filters.sort) {
        case "price_low":
          filteredSitters.sort((a, b) => {
            // Convert Decimal to number for comparison
            const aRate = parseFloat(a.rate.toString());
            const bRate = parseFloat(b.rate.toString());
            return aRate - bRate;
          });
          break;
        case "price_high":
          filteredSitters.sort((a, b) => {
            const aRate = parseFloat(a.rate.toString());
            const bRate = parseFloat(b.rate.toString());
            return bRate - aRate;
          });
          break;
      }
    }

    const mappedSitters = filteredSitters.map((sitter) => {
      const sitterWithUser = sitter as PetSitter & {
        user: {
          name: string;
          image: string;
          location: string;
        };
      };

      return {
        id: sitterWithUser.id,
        userId: sitterWithUser.userId,
        experience: sitterWithUser.experience,
        rate: parseFloat(sitterWithUser.rate.toString()),
        servicesOffered: sitterWithUser.servicesOffered,
        availability: sitterWithUser.availability,
        createdAt: sitterWithUser.createdAt,
        updatedAt: sitterWithUser.updatedAt,
        user: sitterWithUser.user
          ? {
              name: sitterWithUser.user.name || "Unknown",
              image: sitterWithUser.user.image || null,
              location:
                sitterWithUser.user.location || "Location not specified",
            }
          : null,
      };
    });

    return NextResponse.json({ sitters: mappedSitters });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search for sitters" },
      { status: 500 }
    );
  }
}
