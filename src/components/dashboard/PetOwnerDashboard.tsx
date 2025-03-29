"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingStatus, Pet } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function PetOwnerDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, petsRes] = await Promise.all([
          axios.get("/api/bookings"),
          axios.get("/api/pets"),
        ]);
        setBookings(bookingsRes.data.bookings);
        setPets(petsRes.data.pets);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div><Loader2/></div>;
  }

  const handleBookingStatusChange = async (bookingId: string, status: BookingStatus) => {
    try {
      await axios.patch(`/api/bookings/${bookingId}`, { status });
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, status } : booking
      ));

    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex justify-between">
                <div>My Pets
                </div>
                <Button variant="outline" onClick={() => router.push(`/pets`)}>Manage 
                </Button>
              </div>
             
              </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pets.length > 0 ? (
                <ul className="space-y-2">
                  {pets.map((pet: Pet) => (
                    <li key={pet.id} className="flex justify-between items-center">
                      <span>{pet.name} ({pet.type})</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/pets/${pet.id}`)}
                      >
                        View
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No pets added yet.</p>
              )}
              <Button 
                className="w-full mt-4"
                onClick={() => router.push("/pets")}
              >
                Add New Pet
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming">
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming">
                {bookings.filter((booking: any) => 
                  [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status)
                ).length > 0 ? (
                  <div className="space-y-4">
                    {bookings
                      .filter((booking: any) => 
                        [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status)
                      )
                      .map((booking: any) => (
                        <Card key={booking.id}>
                          <CardContent className="pt-4">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium">{booking.sitter.user.name}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(booking.startDate).toLocaleDateString()} - 
                                  {new Date(booking.endDate).toLocaleDateString()}
                                </p>
                                <p className="text-sm mt-1">
                                  Status: <span className="font-medium">{booking.status}</span>
                                </p>
                              </div>
                              <div className="flex gap-2">
                              <Button 
                                variant="outline"
                                onClick={() => router.push(`/bookings/${booking.id}`)}
                              >
                                Details
                              </Button>
                              <Button
                                  size="sm"
                                  className="bg-red-500 hover:bg-red-700"
                                  onClick={() => handleBookingStatusChange(booking.id, BookingStatus.CANCELLED)}
                                >
                                  Cancel
                                </Button>

                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <p>No upcoming bookings.</p>
                )}
                <Button 
                  className="w-full mt-4"
                  onClick={() => router.push("/search")}
                >
                  Find a Pet Sitter
                </Button>
              </TabsContent>
              
              <TabsContent value="past">
                {bookings.filter((booking: any) => 
                  [BookingStatus.COMPLETED, BookingStatus.CANCELLED].includes(booking.status)
                ).length > 0 ? (
                  <div className="space-y-4">
                    {bookings
                      .filter((booking: any) => 
                        [BookingStatus.COMPLETED, BookingStatus.CANCELLED].includes(booking.status)
                      )
                      .map((booking: any) => (
                        <Card key={booking.id}>
                          <CardContent className="pt-4">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium">{booking.sitter.user.name}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(booking.startDate).toLocaleDateString()} - 
                                  {new Date(booking.endDate).toLocaleDateString()}
                                </p>
                                <p className="text-sm mt-1">
                                  Status: <span className="font-medium">{booking.status}</span>
                                </p>
                              </div>
                              <Button 
                                variant="outline"
                                onClick={() => router.push(`/bookings/${booking.id}`)}
                              >
                                Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <p>No past bookings.</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}