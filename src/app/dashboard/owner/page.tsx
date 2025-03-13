"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  MessageSquare,
  Bell,
} from "lucide-react";

// Types
type Pet = {
  id: string;
  name: string;
  type: string;
  imageUrl?: string;
};

type Booking = {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  totalPrice: number;
  pet: Pet;
  sitter: {
    id: string;
    user: {
      id: string;
      name: string;
      image?: string;
      location?: string;
    };
  };
};

export default function OwnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      const fetchData = async () => {
        try {
          // const bookingsRes = await axios.get("/api/bookings/owner");
          // const petsRes = await axios.get("/api/pets");
          
          // setBookings(bookingsRes?.data.bookings);
          // setPets(petsRes.data.pets);
        } catch (error) {
          console.error("Error fetching data:", error);
          // Dummy data for demo purposes
          setBookings([
            {
              id: "1",
              startDate: "2025-03-20T12:00:00.000Z",
              endDate: "2025-03-25T12:00:00.000Z",
              status: "CONFIRMED",
              totalPrice: 150,
              pet: {
                id: "p1",
                name: "Buddy",
                type: "Dog",
                imageUrl: "/api/placeholder/100/100"
              },
              sitter: {
                id: "s1",
                user: {
                  id: "u1",
                  name: "John Smith",
                  image: "/api/placeholder/100/100",
                  location: "New York, NY"
                }
              }
            },
            {
              id: "2",
              startDate: "2025-04-10T12:00:00.000Z",
              endDate: "2025-04-15T12:00:00.000Z",
              status: "PENDING",
              totalPrice: 125,
              pet: {
                id: "p2",
                name: "Max",
                type: "Cat",
                imageUrl: "/api/placeholder/100/100"
              },
              sitter: {
                id: "s2",
                user: {
                  id: "u2",
                  name: "Sarah Johnson",
                  image: "/api/placeholder/100/100",
                  location: "Brooklyn, NY"
                }
              }
            }
          ]);
          
          setPets([
            {
              id: "p1",
              name: "Buddy",
              type: "Dog",
              imageUrl: "/api/placeholder/100/100"
            },
            {
              id: "p2",
              name: "Max",
              type: "Cat",
              imageUrl: "/api/placeholder/100/100"
            }
          ]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Pet Owner Dashboard</h1>

      <Tabs defaultValue="upcoming" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming Bookings</TabsTrigger>
          <TabsTrigger value="past">Past Bookings</TabsTrigger>
          <TabsTrigger value="pets">My Pets</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings
              .filter(booking => new Date(booking.endDate) >= new Date())
              .map(booking => (
                <Card key={booking.id} className="overflow-hidden">
                  <CardHeader className="p-4 bg-blue-50 flex flex-row justify-between items-center">
                    <CardTitle className="text-lg">
                      <span className={`inline-block mr-2 px-2 py-1 text-xs font-medium rounded-full ${
                        booking.status === 'CONFIRMED' 
                          ? 'bg-green-100 text-green-800' 
                          : booking.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                      {booking.pet.name}'s Stay
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-start mb-4">
                      <div className="h-12 w-12 rounded-full overflow-hidden mr-3 bg-gray-200">
                        {booking.sitter.user.image && (
                          <img 
                            src={booking.sitter.user.image} 
                            alt={booking.sitter.user.name} 
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{booking.sitter.user.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {booking.sitter.user.location}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span>
                          {format(new Date(booking.startDate), "MMM d")} - {format(new Date(booking.endDate), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Drop-off/Pick-up times vary</span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-right font-medium">${booking.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between">
                      <Button variant="outline" size="sm" className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                      <Link href={`/bookings/${booking.id}`}>
                        <Button size="sm">View Details</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
            {bookings.filter(booking => new Date(booking.endDate) >= new Date()).length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 mb-4">You don't have any upcoming bookings</p>
                <Link href="/search">
                  <Button>Find a Pet Sitter</Button>
                </Link>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="past">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings
              .filter(booking => new Date(booking.endDate) < new Date())
              .map(booking => (
                <Card key={booking.id} className="overflow-hidden">
                  <CardHeader className="p-4 bg-gray-50 flex flex-row justify-between items-center">
                    <CardTitle className="text-lg">
                      <span className="inline-block mr-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-800">
                        COMPLETED
                      </span>
                      {booking.pet.name}'s Stay
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-start mb-4">
                      <div className="h-12 w-12 rounded-full overflow-hidden mr-3 bg-gray-200">
                        {booking.sitter.user.image && (
                          <img 
                            src={booking.sitter.user.image} 
                            alt={booking.sitter.user.name} 
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{booking.sitter.user.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {booking.sitter.user.location}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span>
                          {format(new Date(booking.startDate), "MMM d")} - {format(new Date(booking.endDate), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-right font-medium">${booking.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between">
                      <Button variant="outline" size="sm">Write a Review</Button>
                      <Link href={`/bookings/${booking.id}`}>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
            {bookings.filter(booking => new Date(booking.endDate) < new Date()).length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No past bookings found</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pets">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map(pet => (
              <Card key={pet.id}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-16 w-16 rounded-full overflow-hidden mr-4 bg-gray-200">
                      {pet.imageUrl && (
                        <img 
                          src={pet.imageUrl} 
                          alt={pet.name} 
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{pet.name}</h3>
                      <p className="text-gray-600">{pet.type}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Link href={`/pets/${pet.id}/edit`}>
                      <Button variant="outline" size="sm">Edit Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Link href="/pets/add" className="block">
              <Card className="h-full border-dashed hover:bg-gray-50 transition-colors">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                  <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                    <Plus className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="font-medium text-blue-600">Add New Pet</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}