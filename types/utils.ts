type Availability = {
  weekly?: string[];
  scheduleType?: "fixed" | "flexible" | "weekly" | "dates";
  selectedDates?: string[];
  blockedDates?: string[];
};
