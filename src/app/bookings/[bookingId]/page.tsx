'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; 
import { useSession } from 'next-auth/react'; 
import axios, { AxiosError } from 'axios'; 
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookingDetails } from '@/components/bookings/BookingDetails'; 
import { PaymentButton } from '@/components/bookings/PaymentButton'; 
import { Loader2, AlertTriangle, ArrowLeft, Star } from 'lucide-react';
import { BookingWithDetails } from '../../../../types/booking';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewWithAuthor } from '../../../../types/review';
import { BookingStatus } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession(); 

  const bookingId = params?.bookingId as string | undefined; 
  
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<'owner' | 'sitter' | 'none'>('none');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hasReviewed, setHasReviewed] = useState<boolean | null>(null); 
  const [review, setReview] = useState<ReviewWithAuthor | null>(null);


  useEffect(() => {
    const fetchBookingAndReview = async () => {
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

      if (sessionStatus === 'authenticated' && bookingId) {
          setIsLoading(true);
          setError(null);
          setHasReviewed(null); 
          setReview(null);

          console.log(`Fetching booking ${bookingId} for user ${session!.user!.id}`);

        try {
          const bookingResponse = await axios.get(`/api/bookings/${bookingId}`);
          const fetchedBooking = bookingResponse.data as BookingWithDetails; 
          
          const ownerUserId = fetchedBooking?.owner?.user?.id;
          const sitterUserId = fetchedBooking?.sitter?.user?.id;
          let role: 'owner' | 'sitter' | 'none' = 'none';

          if (ownerUserId === session!.user!.id) role = 'owner';
          else if (sitterUserId === session!.user!.id) role = 'sitter';

          if (role === 'none') throw new Error("Could not determine role."); 
          setBooking(fetchedBooking);
          setCurrentUserRole(role);

          if (role === 'owner' && fetchedBooking?.status === BookingStatus.COMPLETED) {
            try {
             
              const reviewRes = await axios.get(`/api/bookings/${bookingId}/review`); 
              if (reviewRes.data && reviewRes.data.review) {
                setReview(reviewRes.data.review);
                setHasReviewed(true);
              } else {
                setHasReviewed(false);
              }
            } catch (reviewError: any) {
              if (axios.isAxiosError(reviewError) && reviewError.response?.status === 404) {
                setHasReviewed(false);
                console.log("No review found for this booking.");
              } else {
                console.error("Error checking review status:", reviewError);
                setError(prev => prev ? `${prev} Failed to check review status.` : "Failed to check review status.");
                setHasReviewed(null); 
              }
            }
        } else {
          setHasReviewed(false); 
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

    fetchBookingAndReview();

  }, [bookingId, sessionStatus, session, router]); 


  const handleReviewSubmitted = () => {
    setHasReviewed(true); 
  };

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
  const canLeaveReview = currentUserRole === 'owner' && booking.status === BookingStatus.COMPLETED && hasReviewed === false;
  const reviewAlreadyExists = currentUserRole === 'owner' && booking.status === BookingStatus.COMPLETED && hasReviewed === true;

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

      <div className="mt-6 max-w-4xl mx-auto px-6 pb-6">
      {canLeaveReview && (
          <ReviewForm
                bookingId={booking.id}
              sitterName={booking.sitter.user.name || 'the sitter'}
              onReviewSubmitted={handleReviewSubmitted}
          />
      )}
      {reviewAlreadyExists && review && (
        <Card className="mt-4">
          <CardHeader><CardTitle>Your Review</CardTitle></CardHeader>
            <CardContent>
              <Badge variant="secondary" className="flex items-center gap-1 text-sm">
                {Array.from({length: review.rating})
                  .map((_, index)=><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />)  
                }
              </Badge>
              {review.comment && <p className="mt-2 italic">"{review.comment}"</p>}
            </CardContent>
        </Card>
        )}
        
      </div>

    </div>
    );
}