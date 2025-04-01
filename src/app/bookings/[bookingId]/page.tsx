'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; 
import { useSession } from 'next-auth/react'; 
import axios, { AxiosError } from 'axios'; 
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookingDetails } from '@/components/bookings/BookingDetails'; 
import { PaymentButton } from '@/components/bookings/PaymentButton'; 
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { BookingWithDetails } from '../../../../types/booking';


export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession(); 

  const bookingId = params?.bookingId as string | undefined; 
  
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<'owner' | 'sitter' | 'none'>('none');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
          setError("Booking ID is missing.");
          setIsLoading(false);
          return;
      }

      if (sessionStatus === 'loading') {
          console.log("Waiting for session...");
          return; 
      }

      if (sessionStatus === 'unauthenticated') {
            console.log("User unauthenticated, redirecting to login.");
            router.push(`/login?callbackUrl=/bookings/${bookingId}`);
            return;
      }

      if (sessionStatus === 'authenticated') {
          setIsLoading(true);
          setError(null);
          console.log(`Fetching booking ${bookingId} for user ${session!.user!.id}`);

        try {
          const response = await axios.get(`/api/bookings/${bookingId}`);
          const fetchedBooking = response.data as BookingWithDetails; 
        
          const ownerUserId = fetchedBooking?.owner?.user?.id;
          const sitterUserId = fetchedBooking?.sitter?.user?.id;
          let role: 'owner' | 'sitter' | 'none' = 'none';
          if (ownerUserId === session!.user!.id) role = 'owner';
          else if (sitterUserId === session!.user!.id) role = 'sitter';

          if (role === 'none') {
            console.error("API returned booking but user role isn't determined.");
            setError("Could not determine your role for this booking.");
          } else {
            setBooking(fetchedBooking);
            setCurrentUserRole(role);
            console.log("Booking data set, role:", role);
          }
        } catch (err) {
            console.error("Error fetching booking details:", err);
            if (axios.isAxiosError(err)) {
              const axiosError = err as AxiosError<{ message?: string }>;
              const status = axiosError.response?.status;
              const apiMessage = axiosError.response?.data?.message;

              if (status === 404) {
                  setError("Booking not found.");
              } else if (status === 403) {
                    setError("You don't have permission to view this booking.");
              } else if (status === 401) {
                  setError("Authentication failed. Please log in again.");
                  router.push(`/login?callbackUrl=/bookings/${bookingId}`);
              }
              else {
              setError(apiMessage || "Failed to load booking details.");
              }
            } else {
              setError("An unknown error occurred.");
            }
          } finally {
            setIsLoading(false);
          }
      }
    };

    fetchBooking();

  }, [bookingId, sessionStatus, session, router]); 


  if (isLoading || sessionStatus === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading Booking Details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Booking</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
              </Button>
            </Link>
      </div>
    );
  }

  if (!booking) {

    return (
      <div className="container mx-auto py-8 text-center">
        <p>Booking data could not be loaded.</p>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
            </Button>
        </Link>
      </div>
    );
  }

    return (
    <div className="container mx-auto py-8">
      <div className='mb-6'> 
        <Link href={currentUserRole === 'owner' ? '/dashboard' : '/sitter-dashboard'}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
          </Button>
        </Link>
      </div>

        <BookingDetails booking={booking} currentUserRole={currentUserRole} />

        {currentUserRole === 'owner' && (
          <div className="mt-6 max-w-4xl mx-auto px-6 pb-6"> 
            <PaymentButton booking={booking} />
          </div>
        )}
    </div>
    );
}