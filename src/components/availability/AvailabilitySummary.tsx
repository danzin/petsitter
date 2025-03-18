import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
interface AvailabilitySummaryProps {
  availability: Availability | null;
}

// Compoent accepts a prop, using explicit typing to ensure type safety. 
export const AvailabilitySummary: React.FC<AvailabilitySummaryProps> = ({ availability }) => {
  if (!availability) {
    return (
      <Card className="h-full">
        <CardContent className="p-4 flex items-center justify-center h-full">
          <p className="text-sm text-gray-500">No availability set</p>
        </CardContent>
      </Card>
    );
  }

  const { weekly, scheduleType, selectedDates, blockedDates } = availability;

  if (scheduleType === "weekly" && weekly) {
    const availableDays = Object.entries(weekly)
      .filter(([_, value]: [string, any]) => value.available)
      .map(([day]: [string, any]) => day);

    return (
      <Card className="h-full">
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-2">Weekly Schedule</p>
          <div className="flex flex-wrap gap-2">
            {availableDays.length > 0 ? (
              availableDays.map((day) => (
                <Badge key={day} variant="outline" className="bg-green-50">
                  {day}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-gray-500">No available days set</p>
            )}
          </div>
          
          {availableDays.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500">
                {availableDays.length} day{availableDays.length !== 1 ? "s" : ""} with available time slots
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (scheduleType === "dates" && selectedDates && selectedDates?.length > 0) {
    return (
      <Card className="h-full">
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-2">Specific Dates Schedule</p>
          <div className="flex flex-wrap gap-1">
            {selectedDates?.length > 0 ? (
              <>
                <Badge variant="outline" className="bg-green-50">
                  {selectedDates?.length} available date{selectedDates?.length !== 1 ? "s" : ""}
                </Badge>
                
                {blockedDates && blockedDates.length > 0 && (
                  <Badge variant="outline" className="bg-red-50">
                    {blockedDates.length} blocked date{blockedDates.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">No available dates set</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardContent className="p-4 flex items-center justify-center h-full">
        <p className="text-sm text-gray-500">No availability set</p>
      </CardContent>
    </Card>
  );
};