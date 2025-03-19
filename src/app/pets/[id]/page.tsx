"use client"

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pet } from "@prisma/client";
import { Loader2 } from "lucide-react";

export default function PetPage() {
  const params = useParams();
  const { id } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pet, setPet] = useState<Pet | null>(null);

  useEffect(() => {
    fetchPet();
  }, [id]);

  const fetchPet = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`/api/pets/${id}`);
      setPet(data.pet);
    } catch (error) {
      console.error("Error fetching pet:", error);
      setError("Failed to load pet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container flex justify-center items-center h-screen">
        <p><Loader2/></p>
      </div>
    );
  }

  if (error) {
    return <div className="container text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="relative">
          {pet?.imageUrl ? (
            <Image
              src={pet.imageUrl}
              alt={pet.name}
              width={600}
              height={400}
              className="w-full h-64 object-cover rounded-t-md"
            />
          ) : (
            <div className="w-full h-64 bg-gray-300 flex items-center justify-center rounded-t-md">
              <span className="text-gray-500">No Image Available</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0  bg-opacity-0 w-full p-2">
            <CardTitle className="text-black text-2xl pl-4">{pet?.name}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <div>
            <p className="text-gray-700">
              <span className="font-semibold">Type:</span> {pet?.type}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Breed:</span> {pet?.breed || "N/A"}
            </p>
            {pet?.age !== undefined && (
              <p className="text-gray-700">
                <span className="font-semibold">Age:</span> {pet.age} years
              </p>
            )}
          </div>
          {pet?.description && (
            <div>
              <p className="text-gray-600">{pet.description}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between p-4">
          <Link href="/dashboard">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
