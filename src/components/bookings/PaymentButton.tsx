'use client';
import { useState } from 'react';
import axios from 'axios';
import getStripe from '@/lib/stripe/getStripe';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { PaymentStatus, BookingStatus } from '@prisma/client'; 
import { BookingWithDetails } from '../../../types/booking'; 

interface PaymentButtonProps {
    booking: BookingWithDetails | null; 
}

export function PaymentButton({ booking }: PaymentButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    console.log(`Booking in paymentButton: ${booking?.paymentStatus}`)
    const handlePayment = async () => {
         if (!booking) return; 
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/checkout_sessions', { bookingId: booking.id });
            const { sessionId } = response.data;
            if (!sessionId) throw new Error('Failed to get checkout session ID.');
            const stripe = await getStripe();
            if (!stripe) throw new Error('Stripe.js failed to load.');
            const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
            if (stripeError) throw stripeError;
        } catch (err: any) {
            console.error("Payment initiation failed:", err);
            setError(err.response?.data?.message || err.message || 'Failed to start payment process.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!booking){
      return (
        <div className="space-y-2 pt-4 border-t">
        <h3 className="text-lg font-semibold mb-2">Payment</h3>
        <p className="text-sm mb-3 text-red-700">Booking data not available</p>
      </div>
      )

    }
    if(booking.paymentStatus === PaymentStatus.PAID || booking.status === BookingStatus.CANCELLED) { 
        return (
        <div className="space-y-2 pt-4 border-t">
          <h3 className="text-lg font-semibold mb-2">Payment</h3>
          <p className="text-sm text-muted-foreground mb-3">Booking is {booking.paymentStatus}.</p>
        </div>
        ); 
    }


    return (
      <div className="space-y-2 pt-4 border-t">
        <h3 className="text-lg font-semibold mb-2">Payment</h3>
        <p className="text-sm text-muted-foreground mb-3">Complete your booking by proceeding to payment.</p>
        <Button onClick={handlePayment} disabled={isLoading || booking.status == BookingStatus.PENDING} className="w-full sm:w-auto">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
          {isLoading ? 'Processing...' : 'Proceed to Payment'}
          {booking.status == BookingStatus.PENDING && '(Pending Sitter Confirmation)'}
        </Button>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </div>
    );
}