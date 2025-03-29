import 'server-only'; // Server only!

import { container } from "@/lib/container";
import { BookingService } from "@/services/BookingService";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { notFound, redirect } from "next/navigation";
import { BookingDetails } from "@/components/bookings/BookingDetails";
import { BookingWithDetails } from '../../../../types/booking';

async function getBookingData(bookingId: string): Promise<{ booking: BookingWithDetails, currentUserRole: 'owner' | 'sitter' | 'none' }> {
    const bookingService = container.resolve(BookingService);
    const sessionUser = await getCurrentUser();

    if (!sessionUser?.id) {
        console.log("Booking details page: User not logged in.");
        redirect('/login?callbackUrl=/bookings/' + bookingId);
    }

    console.log(`Fetching booking data for ID: ${bookingId} for user: ${sessionUser.id}`);

    const booking = await bookingService.getBookingById(bookingId) as BookingWithDetails | null;

    if (!booking) {
        console.log(`Booking not found for ID: ${bookingId}`);
        notFound(); 
    }

    const isOwner = booking.owner.user.id === sessionUser.id;
    const isSitter = booking.sitter.user.id === sessionUser.id;

    if (!isOwner && !isSitter) {
        console.log(`Authorization failed: User ${sessionUser.id} is not owner (${booking.owner.user.id}) or sitter (${booking.sitter.user.id}) for booking ${bookingId}`);
        notFound(); 
    }

    const currentUserRole = isOwner ? 'owner' : isSitter ? 'sitter' : 'none';
    console.log(`User role for this booking: ${currentUserRole}`);

    return { booking, currentUserRole };
}

export default async function BookingDetailsPage({ params }: { params: { bookingId: string } }) {
    const { bookingId } = await params;
    console.log(bookingId)
    if (!bookingId) {
        notFound(); 
    }

    const { booking, currentUserRole } = await getBookingData(bookingId);

    return (
        <div className="container mx-auto py-8">
             {/* TODO: Heading or breadcrumbs */}
            <BookingDetails booking={booking} currentUserRole={currentUserRole} />
        </div>
    );
}

export async function generateMetadata({ params }: { params: { bookingId: string } }) {

  return {
    title: `Booking Details`, 
  };
}