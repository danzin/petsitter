"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { AvailabilitySummary } from "@/components/availability/AvailabilitySummary";

export default function PetSitterDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [sitterProfile, setSitterProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, profileRes] = await Promise.all([
          axios.get("/api/bookings/sitter"),
          axios.get("/api/sitter-profile"),
        ]);
        setBookings(bookingsRes.data.bookings);
        setSitterProfile(profileRes.data.profile);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Rate:</p>
                <p>${sitterProfile?.rate}/hour</p>
              </div>
              <div>
                <p className="text-sm font-medium">Services:</p>
                <ul className="list-disc list-inside">
                  {sitterProfile?.servicesOffered?.length ? (
                    sitterProfile.servicesOffered.map((service: string, index: number) => (
                      <li key={index}>{service}</li>
                    ))
                  ) : (
                    <li>No services listed</li>
                  )}
                </ul>
              </div>
           
              <Button 
                className="w-full mt-2"
                onClick={() => router.push("/sitter-profile-setup")}
              >
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming">
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="pending">Pending Requests</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming">
                {bookings.filter((booking: any) => 
                  booking.status === BookingStatus.CONFIRMED
                ).length > 0 ? (
                  <div className="space-y-4">
                    {bookings
                      .filter((booking: any) => booking.status === BookingStatus.CONFIRMED)
                      .map((booking: any) => (
                        <Card key={booking.id}>
                          <CardContent className="pt-4">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium">{booking.owner.user.name}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(booking.startDate).toLocaleDateString()} -
                                  {new Date(booking.endDate).toLocaleDateString()}
                                </p>
                                <p className="text-sm mt-1">
                                  Pets: {booking.pets.map((pet: any) => pet.name).join(", ")}
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
                  <p>No upcoming bookings.</p>
                )}
              </TabsContent>

              <TabsContent value="pending">
                {bookings.filter((booking: any) => 
                  booking.status === BookingStatus.PENDING
                ).length > 0 ? (
                  <div className="space-y-4">
                    {bookings
                      .filter((booking: any) => booking.status === BookingStatus.PENDING)
                      .map((booking: any) => (
                        <Card key={booking.id}>
                          <CardContent className="pt-4">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium">{booking.owner.user.name}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(booking.startDate).toLocaleDateString()} - 
                                  {new Date(booking.endDate).toLocaleDateString()}
                                </p>
                                <p className="text-sm mt-1">
                                  Pets: {booking.pets.map((pet: any) => pet.name).join(", ")}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/bookings/${booking.id}`)}
                                >
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleBookingStatusChange(booking.id, BookingStatus.CONFIRMED)}
                                >
                                  Accept
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <p>No pending requests.</p>
                )}
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
                                <p className="font-medium">{booking.owner.user.name}</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Availability Management</CardTitle>
        </CardHeader>
        <CardContent>
          {sitterProfile?.availability ?  
           <div className="mb-4">
              <AvailabilitySummary availability={sitterProfile?.availability} />
            </div> :
            <p className="mb-4">Set your availability to let pet owners know when you're free</p>
          }
         
          <Button onClick={() => router.push("/availability")}>
            Manage Availability
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}