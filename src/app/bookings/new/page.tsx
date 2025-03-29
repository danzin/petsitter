import { BookingForm } from '@/components/bookings/BookingForm';

export default function NewBookingPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Request a Booking</h1>
      <BookingForm />
    </div>
  );
}