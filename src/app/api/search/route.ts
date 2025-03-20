import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/container";
import { SitterService } from "@/services/SitterService";
import { Decimal } from "@prisma/client/runtime/library";

export async function GET(request: NextRequest) {
  try {
    const sitterService = container.resolve(SitterService);

    // Get search parameters
    const searchParams = request.nextUrl.searchParams;
    const location = searchParams.get("location");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const services = searchParams.getAll("services");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort");

    // Location is always requird
    console.log(location);
    if (!location) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }

    // Get sitters based on basic criteria
    const sitters = await sitterService.findAvailableSitters({
      location,
      services: services || [],
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
    console.log(sitters);

    // Apply additional filters
    let filteredSitters = [...sitters];

    if (maxPrice) {
      const maxPriceDecimal = new Decimal(maxPrice);
      filteredSitters = filteredSitters.filter((sitter) =>
        sitter.rate.lessThanOrEqualTo(maxPriceDecimal)
      );
    }

    // Sort
    if (sort) {
      switch (sort) {
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

    const mappedSitters = filteredSitters.map((sitter) => ({
      id: sitter.id,
      userId: sitter.userId,
      experience: sitter.experience,
      rate: parseFloat(sitter.rate.toString()),
      servicesOffered: sitter.servicesOffered,
      availability: sitter.availability,
      createdAt: sitter.createdAt,
      updatedAt: sitter.updatedAt,
    }));

    return NextResponse.json({ sitters: mappedSitters });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search for sitters" },
      { status: 500 }
    );
  }
}

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

    const mappedSitters = filteredSitters.map((sitter) => ({
      id: sitter.id,
      userId: sitter.userId,
      experience: sitter.experience,
      rate: parseFloat(sitter.rate.toString()),
      servicesOffered: sitter.servicesOffered,
      availability: sitter.availability,
      createdAt: sitter.createdAt,
      updatedAt: sitter.updatedAt,
    }));

    return NextResponse.json({ sitters: mappedSitters });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search for sitters" },
      { status: 500 }
    );
  }
}
