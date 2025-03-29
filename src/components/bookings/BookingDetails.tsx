import { Booking } from "@prisma/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from 'date-fns'; 
import { Clock, CalendarDays, User as UserIcon, Dog, Cat, PawPrint, Mail, StickyNote, CircleDollarSign, Star } from "lucide-react";
import { BookingDetailsProps } from "../../../types/booking";


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

export function BookingDetails({ booking, currentUserRole }: BookingDetailsProps) {

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
                                 ${booking.price.toFixed(2)} 
                             </p>
                         </div>

                    </div>
                </div>

                 {/* Reviews come later */}
                 {/* <div>
                      <h3 className="text-lg font-semibold mb-2 flex items-center"><Star className="mr-2 h-5 w-5 text-primary" /> Review</h3>
                      </div> */}

            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
                 {/* {currentUserRole === 'owner' && booking.status === 'PENDING' && <Button variant="destructive">Cancel Request</Button>} */}
                 {/* {currentUserRole === 'sitter' && booking.status === 'PENDING' && <Button>Accept Request</Button>} */}
            </CardFooter>
        </Card>
    );
}