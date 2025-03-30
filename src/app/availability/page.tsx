"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";


const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00", 
  "18:00", "19:00", "20:00"
];

const weekdays = [
  "Monday", "Tuesday", "Wednesday", "Thursday", 
  "Friday", "Saturday", "Sunday"
];

export default function AvailabilityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Two types of availability: weekly recurring and specific dates
  const [weeklyAvailability, setWeeklyAvailability] = useState<{
    [key: string]: { available: boolean; timeSlots: string[] }
  }>({});
  
  // For specific dates and blocked dates
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  
  // Whether the sitter prefers to use weekly recurring schedule or specific dates
  const [scheduleType, setScheduleType] = useState<"weekly" | "dates">("weekly");

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await axios.get("/api/availability");
        const data = response.data;
        
        if (data.availability) {

          if (data.availability.weekly) {
            setWeeklyAvailability(data.availability.weekly);
          } else {
            // Set default weekly availability if none exists
            initializeDefaultWeeklyAvailability();
          }
          
          // Set specific dates and blocked dates
          if (data.availability.selectedDates) {
            setSelectedDates(data.availability.selectedDates.map((d: string) => new Date(d)));
          }
          
          if (data.availability.blockedDates) {
            setBlockedDates(data.availability.blockedDates.map((d: string) => new Date(d)));
          }
          
          // Set schedule type preference
          if (data.availability.scheduleType) {
            setScheduleType(data.availability.scheduleType);
          }
        } else {
          // Initialize with default values if no availability set
          initializeDefaultWeeklyAvailability();
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
        toast.error("Failed to load availability settings");
        // Initialize with defaults on error
        initializeDefaultWeeklyAvailability();
      } finally {
        setIsLoading(false);
      }
    };

    const initializeDefaultWeeklyAvailability = () => {
      const defaultWeekly = weekdays.reduce((acc, day) => {
        acc[day] = { available: false, timeSlots: [] };
        return acc;
      }, {} as { [key: string]: { available: boolean; timeSlots: string[] } });
      setWeeklyAvailability(defaultWeekly);
    };

    if (session?.user) {
      fetchAvailability();
    }
  }, [session]);

  const handleWeeklyAvailabilityChange = (day: string, isAvailable: boolean) => {
    setWeeklyAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], available: isAvailable }
    }));
  };

  const handleTimeSlotChange = (day: string, timeSlot: string) => {
    setWeeklyAvailability(prev => {
      const currentSlots = prev[day]?.timeSlots || [];
      const newSlots = currentSlots.includes(timeSlot) 
        ? currentSlots.filter(slot => slot !== timeSlot)
        : [...currentSlots, timeSlot].sort();
      
      return {
        ...prev,
        [day]: { ...prev[day], timeSlots: newSlots }
      };
    });
  };

  const handleSaveAvailability = async () => {
    setSaving(true);
    try {
      // Format dates for the API
      const formattedSelectedDates = selectedDates.map(date => date.toISOString());
      const formattedBlockedDates = blockedDates.map(date => date.toISOString());
      

      const availabilityData = {
        weekly: weeklyAvailability,
        selectedDates: formattedSelectedDates,
        blockedDates: formattedBlockedDates,
        scheduleType
      };
      
      await axios.post("/api/availability", { availability: availabilityData });
      toast.success("Availability settings saved successfully");
      
      // Redirect back to dashboard after saving
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error("Failed to save availability settings");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Your Availability</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Schedule Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <input 
                type="radio" 
                id="weekly-schedule" 
                name="schedule-type" 
                checked={scheduleType === "weekly"}
                onChange={() => setScheduleType("weekly")}
              />
              <Label htmlFor="weekly-schedule">Weekly Recurring Schedule</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="radio" 
                id="specific-dates" 
                name="schedule-type" 
                checked={scheduleType === "dates"}
                onChange={() => setScheduleType("dates")}
              />
              <Label htmlFor="specific-dates">Specific Dates</Label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {scheduleType === "weekly" && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {weekdays.map((day) => (
                <div key={day} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`available-${day}`}
                      checked={weeklyAvailability[day]?.available || false}
                      onCheckedChange={(checked) => 
                        handleWeeklyAvailabilityChange(day, checked === true)
                      }
                    />
                    <Label htmlFor={`available-${day}`}>{day}</Label>
                  </div>
                  
                  {weeklyAvailability[day]?.available && (
                    <div className="ml-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {timeSlots.map((timeSlot) => (
                        <div key={`${day}-${timeSlot}`} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`${day}-${timeSlot}`}
                            checked={weeklyAvailability[day]?.timeSlots?.includes(timeSlot) || false}
                            onCheckedChange={() => handleTimeSlotChange(day, timeSlot)}
                          />
                          <Label htmlFor={`${day}-${timeSlot}`}>{timeSlot}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Separator className="my-4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {scheduleType === "dates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={setSelectedDates as any}
                className="rounded-md border"
              />
              <p className="mt-2 text-sm text-gray-500">
                Selected {selectedDates.length} date(s)
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Blocked Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="multiple"
                selected={blockedDates}
                onSelect={setBlockedDates as any}
                className="rounded-md border"
              />
              <p className="mt-2 text-sm text-gray-500">
                Blocked {blockedDates.length} date(s)
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="flex justify-end gap-4">
        <Button 
          variant="outline" 
          onClick={() => router.push("/dashboard")}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSaveAvailability}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Availability"
          )}
        </Button>
      </div>
    </div>
  );
}