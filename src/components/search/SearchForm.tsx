"use client"

import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  location: z.string().min(1, "Location is required"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  services: z.array(z.string()).optional(),
});

const services = [
  { id: "dog_walking", label: "Dog Walking" },
  { id: "pet_sitting", label: "Pet Sitting" },
  { id: "boarding", label: "Boarding" },
  { id: "daycare", label: "Daycare" },
];

export function SearchForm() {
  const router = useRouter();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      services: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {

    const params = new URLSearchParams();
    params.append("location", values.location);
    
    if (values.startDate) {
      params.append("startDate", values.startDate.toISOString());
    }
    
    if (values.endDate) {
      params.append("endDate", values.endDate.toISOString());
    }
    
    if (values.services && values.services.length > 0) {
      values.services.forEach(service => {
        params.append("services", service);
      });
    }
    
    router.push(`/search?${params.toString()}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter city or zip code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span className="text-muted-foreground">Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span className="text-muted-foreground">Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => {
                      if (date < new Date()) {
                        return true;
                      }
                      const startDate = form.getValues("startDate");
                      if (startDate && date < startDate) {
                        return true;
                      }
                      return false;
                    }}
                    initialFocus
                  />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="services"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Services</FormLabel>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {services.map((service) => (
                  <FormField
                    key={service.id}
                    control={form.control}
                    name="services"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={service.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(service.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value || [], service.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== service.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {service.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full md:w-auto">Search Sitters</Button>
      </form>
    </Form>
  );
}