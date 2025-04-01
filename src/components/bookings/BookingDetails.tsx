"use client";

import { useState } from "react";
import { Booking, BookingStatus, UserType } from "@prisma/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from 'date-fns'; 
import { Clock, CalendarDays, User as UserIcon, Dog, Cat, PawPrint, Mail, StickyNote, CircleDollarSign, Star } from "lucide-react";
import { BookingDetailsProps } from "../../../types/booking";
import { Button } from "../ui/button";
import axios from "axios";
import { toast } from "sonner";
const getInitials = (name?: string | null) => {
  if (!name) return "?";
  return name.split(' ').map(part => part[0]).join('').toUpperCase();
};

const getStatusVariant = (status: Booking['status']): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
      case 'CONFIRMED': return "default"; 
      case 'COMPLETED': return "secondary"; 
      case 'PENDING': return "outline"; 
      case 'CANCELLED': return "destructive"; 
      default: return "outline";
  }
};

export function BookingDetails({ booking: initialBooking, currentUserRole }: BookingDetailsProps) {
  const [booking, setBooking] = useState(initialBooking);
  const [isLoading, setIsLoading] = useState(false);

  if(!booking){
      console.error("Booking data is not available.");
      return (
      <div className="space-y-2 pt-4 border-t">
          <h3 className="text-lg font-semibold mb-2">Payment</h3>
          <p className="text-sm mb-3 text-red-700">Booking data not available</p>
      </div>
      )
  }
  
  const handleBookingStatusChange = async (bookingId: string, status: BookingStatus) => {
    setIsLoading(true);
    try {
      const response = await axios.patch(`/api/bookings/${bookingId}`, { status });
      
      setBooking({
          ...booking,
          status: status
      });
      
      toast.success('Status updated', {                description: `Booking ${status.toLowerCase()} successfully.`,
    })
        
    } catch (error) {
      console.error("Error updating booking status:", error);
  
      toast.error('Update Failed', {                description: "Could not update booking status. Please try again."
    })

    } finally {
      setIsLoading(false);
    }
  };

  const formattedStartDate = format(new Date(booking.startDate), "eee, MMM d, yyyy 'at' h:mm a");
  const formattedEndDate = format(new Date(booking.endDate), "eee, MMM d, yyyy 'at' h:mm a");
  const formattedCreatedAt = format(new Date(booking.createdAt), "MMM d, yyyy");

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
          <CardTitle className="text-2xl">Booking Details</CardTitle>
          <CardDescription>
              Booking ID: {booking.id} | Requested on: {formattedCreatedAt}
          </CardDescription>
          <div className="pt-2">
                <Badge variant={getStatusVariant(booking.status)} className="text-sm">
                    {booking.status}
                </Badge>
            </div>
      </CardHeader>
        <CardContent className="space-y-6">
            <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Col 1 People & Dates */}
            <div className="space-y-4">
                {/* Sitter Info */}
              <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center"><UserIcon className="mr-2 h-5 w-5 text-primary" /> Sitter Details</h3>
                    <div className="flex items-center space-x-3">
                        <Avatar>
                            <AvatarImage src={booking.sitter.user?.image ?? undefined} alt={booking.sitter.user?.name ?? 'Sitter'} />
                            <AvatarFallback>{getInitials(booking.sitter.user?.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{booking.sitter.user?.name || "Sitter Name Unavailable"}</p>
                            <p className="text-sm text-muted-foreground flex items-center">
                                <Mail className="mr-1 h-3 w-3" /> {booking.sitter.user?.email || "No email"}
                            </p>
                        </div>
                    </div>
              </div>

                {/* Owner Info */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center"><UserIcon className="mr-2 h-5 w-5 text-primary" /> Owner Details</h3>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={booking.owner.user?.image ?? undefined} alt={booking.owner.user?.name ?? 'Owner'} />
                    <AvatarFallback>{getInitials(booking.owner.user?.name)}</AvatarFallback>
                  </Avatar>
                    <div>
                      <p className="font-medium">{booking.owner.user?.name || "Owner Name Unavailable"}</p>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Mail className="mr-1 h-3 w-3" /> {booking.owner.user?.email || "No email"}
                      </p>
                    </div>
                </div>
              </div>

                  {/* Dates */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary" /> Booking Dates</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">From:</span> {formattedStartDate}</p>
                  <p><span className="font-medium">To:</span> {formattedEndDate}</p>
                </div>
              </div>

            </div>

              {/* Col 2 Pets, Notes & Price */}
            <div className="space-y-4">
              {/* Pets */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center"><PawPrint className="mr-2 h-5 w-5 text-primary" /> Pet(s)</h3>
                <ul className="space-y-2 list-none pl-0">
                {booking.pets.length > 0 ? booking.pets.map(pet => (
                  <li key={pet.id} className="flex items-center text-sm border-b pb-1">
                    {pet.type.toLowerCase() === 'dog' ? <Dog className="mr-2 h-4 w-4 text-muted-foreground" /> : pet.type.toLowerCase() === 'cat' ? <Cat className="mr-2 h-4 w-4 text-muted-foreground" /> : <PawPrint className="mr-2 h-4 w-4 text-muted-foreground" />}
                    <span className="font-medium">{pet.name}</span>
                    <span className="text-muted-foreground ml-1">({pet.type}{pet.breed ? `, ${pet.breed}` : ''})</span>
                  </li>
                )) : (
                  <p className="text-sm text-muted-foreground">No pets associated with this booking.</p>
                )}
              </ul>
              </div>

                {/* Notes */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center"><StickyNote className="mr-2 h-5 w-5 text-primary" /> Notes from Owner</h3>
                <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-md min-h-[50px]">
                    {booking.notes || "No notes provided."}
                </p>
              </div>

                {/* Price */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center"><CircleDollarSign className="mr-2 h-5 w-5 text-primary" /> Booking Price</h3>
                <p className="text-xl font-bold">
                  ${Number(booking.price).toFixed(2)} 
                </p>
                {booking.paymentStatus && (
                  <p className={`text-sm mt-1 ${booking.paymentStatus === 'PAID' ? 'text-green-600' : booking.paymentStatus === 'FAILED' ? 'text-red-600' : 'text-amber-600'}`}>
                    Payment status: {booking.paymentStatus}
                  </p>
                )}
              </div>

            </div>
          </div>

            {/* Reviews come later */}
            {/* <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center"><Star className="mr-2 h-5 w-5 text-primary" /> Review</h3>
                </div> */}

        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {booking.status === 'PENDING' && 
            <Button 
              variant="destructive" 
              onClick={() => handleBookingStatusChange(booking.id, BookingStatus.CANCELLED)}
              disabled={isLoading}
            >
              {isLoading ? 'Cancelling...' : 'Cancel Request'}
            </Button>
          }
          {currentUserRole === "sitter" && booking.status === 'PENDING' && 
            <Button 
              onClick={() => handleBookingStatusChange(booking.id, BookingStatus.CONFIRMED)}
              disabled={isLoading}
            >
              {isLoading ? 'Accepting...' : 'Accept Request'}
            </Button>
          }
      </CardFooter>
  </Card>
  );
}