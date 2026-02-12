import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Event } from "@shared/schema";

const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;

const eventRegistrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required").regex(phoneRegex, "Phone number must be in format: 555-555-5555"),
  participationType: z.enum(["participant", "volunteer"], { 
    required_error: "Please select a participation type" 
  }),
  notes: z.string().optional(),
});

type EventRegistrationFormData = z.infer<typeof eventRegistrationSchema>;

interface EventRegistrationFormProps {
  eventId: string;
  onSuccess?: () => void;
}

function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours);
  const minute = parseInt(minutes);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function EventRegistrationForm({ eventId, onSuccess }: EventRegistrationFormProps) {
  const { toast } = useToast();

  const { data: event } = useQuery<Event>({
    queryKey: ["/api/events", eventId],
  });

  const form = useForm<EventRegistrationFormData>({
    resolver: zodResolver(eventRegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      participationType: "participant",
      notes: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: EventRegistrationFormData) => {
      const response = await apiRequest("POST", "/api/registrations", {
        ...data,
        eventId,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "You have been registered successfully. Check your email for confirmation.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      form.reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EventRegistrationFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="space-y-4">
      {/* Event Information Card */}
      {event && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <CardDescription>{event.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">{formatDate(event.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium">{formatTime(event.time)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{event.location}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Registration Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="555-555-5555" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="participationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How would you like to participate?</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select participation type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="participant">Participant</SelectItem>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Any special requests or information..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {registerMutation.isPending ? "Registering..." : "Register for Event"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
