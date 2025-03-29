'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; 
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; 
import { CalendarIcon } from "lucide-react"; 
import { format } from "date-fns"; 

import { Pet } from '@prisma/client';
import Link from 'next/link';

export function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();

  const sitterId = searchParams.get('sitterId');

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [ownerPets, setOwnerPets] = useState<Pet[]>([]);
  const [isPetsLoading, setIsPetsLoading] = useState(true);
  const [sitterRate, setSitterRate] = useState<number | null>(null); 
  const [sitterName, setSitterName] = useState<string | null>(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      const fetchSitterDetails = async () => {
         if (!sitterId) {
            setError("Sitter ID missing.");
            setIsDataLoading(false);
            return;
         };
         try {

            const response = await axios.get(`/api/sitter/${sitterId}`);
            const rate = parseFloat(response.data.sitter.rate);
            if (isNaN(rate)) {
                throw new Error("Invalid rate received from server.");
            }
            setSitterRate(rate);
            setSitterName(response.data.sitter.name || 'the sitter');
         } catch (err: any) {
             console.error("Failed to fetch sitter details:", err);
             setError(err.response?.data?.message || "Could not load sitter information.");
         }
      };
      fetchSitterDetails();
  }, [sitterId]);

  // Fetch Owner Pets
  useEffect(() => {
    const fetchPets = async () => {
        if (!session?.user?.id) {
            console.log("Pet Fetch: Waiting for session user ID.");

            if (sessionStatus === 'unauthenticated') {
                setIsPetsLoading(false);
                setOwnerPets([]); 
            }
            return;
        }

        console.log("Pet Fetch: Attempting fetch for user:", session.user.id);
        setIsPetsLoading(true);

        try {
            const response = await axios.get('/api/pets');

            // **Crucial:** Validate the response structure before using it
            if (response && response.data && Array.isArray(response.data.pets)) {
                setOwnerPets(response.data.pets);
                console.log("Pet Fetch: Pets state updated:", response.data.pets);
            } else {
                console.error("Pet Fetch: Invalid response data structure received:", response.data);
                setError(prev => prev ? `${prev} Invalid pet data.` : "Invalid pet data received.");
                setOwnerPets([]);
            }
        } catch (err: any) { 
            console.error('Pet Fetch: API call failed:', err);
            if (err.response) {
               
                console.error("Pet Fetch: Error data:", err.response.data);
                console.error("Pet Fetch: Error status:", err.response.status);
                setError(prev => prev ? `${prev} Failed: ${err.response.data?.message || err.response.status}` : `Failed to load pets: ${err.response.data?.message || err.response.status}`);
            } else if (err.request) {
                console.error("Pet Fetch: No response received:", err.request);
                setError(prev => prev ? `${prev} No server response.` : "Could not reach server to load pets.");
            } else {
                console.error("Pet Fetch: Request setup error:", err.message);
                setError(prev => prev ? `${prev} Request error.` : "Error setting up pet request.");
            }
            setOwnerPets([]); 
        } finally {
            setIsPetsLoading(false); 
        }
    };

    if (sessionStatus === 'authenticated') {
        fetchPets();
    } else if (sessionStatus === 'unauthenticated') {
        setError("You must be logged in to book."); 
        setIsPetsLoading(false);
        setOwnerPets([]);
    } else {
        console.log("Pet Fetch: Session status is loading...");
    }

  
}, [sessionStatus, session]); 


  const handlePetSelection = (petId: string) => {
    setSelectedPetIds((prev) =>
      prev.includes(petId) ? prev.filter((id) => id !== petId) : [...prev, petId]
    );
  };

  // Memoize price calculations
  const calculatedPrice = useMemo(() => {
    if (!startDate || !endDate || !sitterRate || endDate <= startDate) {
        return null; 
    }
    const durationMillis = endDate.getTime() - startDate.getTime();
    const durationHours = durationMillis / (1000 * 60 * 60);

    const price = sitterRate * durationHours;
    return price.toFixed(2); // 2 decimals
  }, [startDate, endDate, sitterRate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (sessionStatus !== 'authenticated' || !session?.user?.id) {
        setError("Authentication error. Please log in again.");
        return;
    }
    if (!sitterId) {
      setError('Sitter information is missing. Cannot proceed.');
      return;
    }
    if (!startDate || !endDate) {
        setError('Please select both a start and end date.');
        return;
    }
     if (endDate <= startDate) {
        setError('End date must be after start date.');
        return;
    }
    if (selectedPetIds.length === 0) {
      setError('Please select at least one pet for the booking.');
      return;
    }

    setIsLoading(true);

    // Prepare data FOR THE BACKEND - NO ownerId, NO price
    const bookingData = {
      sitterId: sitterId, 
      startDate: startDate.toISOString(), 
      endDate: endDate.toISOString(), 
      petIds: selectedPetIds,
      notes: notes,
    };

    try {
      const response = await axios.post('/api/bookings', bookingData);

      if (response.status === 201 && response.data.booking?.id) {
          router.push(`/bookings/${response.data.booking.id}`);
      } else {
          throw new Error("Booking creation did not return expected data.");
      }
    } catch (err: any) {
      console.error('Booking failed:', err);
      setError(err.response?.data?.message || 'An unexpected error occurred while creating the booking.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isDataLoading && sessionStatus === 'loading') {
      return <p>Loading your details...</p>; 
  }
   if (error && !ownerPets.length) { 
       return <p className="text-red-600">Error: {error}</p>;
   }
   if (!sitterId) {
       return <p className="text-red-600">Error: Sitter ID is missing. Please go back to search.</p>;
   }


  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
        {sitterName && <h2 className="text-xl font-semibold mb-4">Book {sitterName}</h2>}
      {/* --- Date Range Picker --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField name="startDate" label="Start Date">
            <Popover>
              <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${!startDate && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP HH:mm") : <span>Pick start date & time</span>}
                  </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  // Maybe add time picker or separate time input? 
                />
                 {/* Simple Time Input */}
                 <div className="p-2 border-t">
                    <Label htmlFor="startTime">Time (HH:MM)</Label>
                    <Input id="startTime" type="time" step="900" /* 15min */
                       defaultValue={startDate ? format(startDate, 'HH:mm') : '09:00'}
                       onChange={(e) => {
                           if(startDate && e.target.value) {
                               const [hours, minutes] = e.target.value.split(':').map(Number);
                               const newDate = new Date(startDate);
                               newDate.setHours(hours, minutes, 0, 0);
                               setStartDate(newDate);
                           }
                       }}/>
                 </div>
              </PopoverContent>
            </Popover>
        </FormField>

         <FormField name="endDate" label="End Date">
             <Popover>
                 <PopoverTrigger asChild>
                     <Button
                         variant="outline"
                         className={`w-full justify-start text-left font-normal ${!endDate && "text-muted-foreground"}`}
                     >
                         <CalendarIcon className="mr-2 h-4 w-4" />
                         {endDate ? format(endDate, "PPP HH:mm") : <span>Pick end date & time</span>}
                     </Button>
                 </PopoverTrigger>
                 <PopoverContent className="w-auto p-0">
                     <Calendar
                         mode="single"
                         selected={endDate}
                         onSelect={setEndDate}
                         disabled={(date) => startDate ? date < startDate : date < new Date()} // No dates before start date
                         initialFocus
                     />
                      {/* Simple Time Input */}
                     <div className="p-2 border-t">
                         <Label htmlFor="endTime">Time (HH:MM)</Label>
                         <Input id="endTime" type="time" step="900"
                            defaultValue={endDate ? format(endDate, 'HH:mm') : '17:00'}
                            onChange={(e) => {
                                if(endDate && e.target.value) {
                                    const [hours, minutes] = e.target.value.split(':').map(Number);
                                    const newDate = new Date(endDate);
                                    newDate.setHours(hours, minutes, 0, 0);
                                    setEndDate(newDate);
                                }
                            }}/>
                     </div>
                 </PopoverContent>
             </Popover>
         </FormField>
      </div>


      {/* --- Pet Selection --- */}
      <div>
        <Label>Select Pets ({selectedPetIds.length} selected)</Label>
        {ownerPets.length > 0 ? (
          <div className="space-y-2 border p-4 rounded-md max-h-48 overflow-y-auto">
            {ownerPets.map((pet) => (
              <div key={pet.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`pet-${pet.id}`}
                  checked={selectedPetIds.includes(pet.id)}
                  onCheckedChange={() => handlePetSelection(pet.id)}
                />
                <Label htmlFor={`pet-${pet.id}`} className="font-normal cursor-pointer">
                  {pet.name} ({pet.type}{pet.breed ? `, ${pet.breed}` : ''})
                </Label>
              </div>
            ))}
          </div>
        ) : (
           sessionStatus === 'authenticated' && !isDataLoading ?
          <p className="text-sm text-gray-500">You haven't added any pets yet. <Link href="/pets" className="text-blue-600 hover:underline">Add a pet</Link>.</p>
            : !isDataLoading && <p className="text-sm text-gray-500">Login to see your pets.</p>
        )}
      </div>

      {/* --- Notes --- */}
      <div>
        <Label htmlFor="notes">Notes for the Sitter (Optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special instructions, feeding times, medication, etc.?"
          rows={3}
        />
      </div>

       {/* --- Price Display (Estimate) --- */}
       {calculatedPrice !== null && sitterRate && (
            <div className="bg-gray-50 p-3 rounded-md text-center">
                <p className="text-lg font-semibold">Estimated Price: ${calculatedPrice}</p>
                <p className="text-xs text-gray-500">Based on ${sitterRate}/hour. Final price confirmed by sitter.</p>
            </div>
        )}

      {/* --- Error Display --- */}
      {error && <p className="text-red-600 text-sm p-3 bg-red-50 rounded-md">{error}</p>}

      {/* --- Submit Button --- */}
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || selectedPetIds.length === 0 || !startDate || !endDate || endDate <= startDate || sessionStatus !== 'authenticated'}
      >
        {isLoading ? 'Sending Request...' : 'Request Booking'}
      </Button>
    </form>
  );
}

// Helper component for Form Fields
function FormField({ name, label, children }: { name: string, label: string, children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <Label htmlFor={name}>{label}</Label>
            {children}
        </div>
    );
}