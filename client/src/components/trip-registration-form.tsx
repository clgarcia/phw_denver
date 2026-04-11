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
import { Loader2, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Trip } from "@shared/schema";
import { useState } from "react";

const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;

const tripRegistrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required").regex(phoneRegex, "Phone number must be in format: 555-555-5555"),
  participationType: z.enum(["participant", "volunteer"], { 
    required_error: "Please select a participation type" 
  }),
  notes: z.string().optional(),
});

type TripRegistrationFormData = z.infer<typeof tripRegistrationSchema>;

interface TripRegistrationFormProps {
  tripId: string;
  onSuccess?: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function formatTime(timeString: string): string {
  if (!timeString) return '';
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch {
    return timeString;
  }
}

export function TripRegistrationForm({ tripId, onSuccess }: TripRegistrationFormProps) {
  const { toast } = useToast();
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState("");

  const { data: trip } = useQuery<Trip>({
    queryKey: ["/api/trips", tripId],
  });

  // Fetch the global registration PIN from settings
  const { data: settingsData } = useQuery({
    queryKey: ["/api/settings/registration-pin"],
  });

  const globalPin = settingsData?.pin as string | undefined;

  // If trip is full, show full message
  if (trip?.isFull) {
    return (
      <div className="space-y-4">
        {trip && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">{trip.name}</CardTitle>
            </CardHeader>
          </Card>
        )}
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>This trip is currently full and registration is not available.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // If Google Form URL is provided with a global PIN, show PIN verification
  if (trip?.googleFormUrl && globalPin) {
    const isPinCorrect = enteredPin === globalPin;

    const handleRegisterClick = () => {
      if (!isPinCorrect) {
        setPinError("Incorrect PIN. Please try again.");
        return;
      }
      window.open(trip.googleFormUrl, "_blank");
    };

    return (
      <div className="space-y-4">
        {/* Trip Information Card */}
        {trip && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">{trip.name}</CardTitle>
            </CardHeader>
          </Card>
        )}
        
        {/* PIN Verification Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Registration</CardTitle>
            <CardDescription>Enter the PIN to register for this trip</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pinError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{pinError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <label htmlFor="pin" className="text-sm font-medium">
                PIN
              </label>
              <Input
                id="pin"
                type="text"
                placeholder="Enter PIN"
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value);
                  setPinError("");
                }}
                className="text-center text-lg tracking-widest"
              />
            </div>
            <Button 
              className="w-full"
              onClick={handleRegisterClick}
              disabled={!isPinCorrect}
            >
              Register for Trip
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If Google Form URL is provided without PIN, redirect immediately
  if (trip?.googleFormUrl) {
    return (
      <div className="space-y-4">
        {/* Trip Information Card */}
        {trip && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">{trip.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date:</span>
                <span className="font-medium">{formatDate(trip.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">End Date:</span>
                <span className="font-medium">{formatDate(trip.endDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">{formatTime(trip.startTime)} - {formatTime(trip.endTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Meetup Location:</span>
                <span className="font-medium">{trip.meetupLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destination:</span>
                <span className="font-medium">{trip.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{trip.durationDays}d / {trip.durationNights}n</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Difficulty:</span>
                <span className="font-medium">{trip.difficultyLevel}</span>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="flex flex-col gap-2 pt-4">
          <a 
            href={trip?.googleFormUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button className="w-full">
              Register for Trip
            </Button>
          </a>
        </div>
      </div>
    );
  }

  const form = useForm<TripRegistrationFormData>({
    resolver: zodResolver(tripRegistrationSchema),
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
    mutationFn: async (data: TripRegistrationFormData) => {
      const response = await apiRequest("POST", "/api/registrations", {
        ...data,
        tripId,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "You have been registered successfully. Check your email for confirmation.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
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

  const onSubmit = (data: TripRegistrationFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="space-y-4">
      {/* Trip Information Card */}
      {trip && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">{trip.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start Date:</span>
              <span className="font-medium">{formatDate(trip.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">End Date:</span>
              <span className="font-medium">{formatDate(trip.endDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium">{formatTime(trip.startTime)} - {formatTime(trip.endTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Meetup Location:</span>
              <span className="font-medium">{trip.meetupLocation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Destination:</span>
              <span className="font-medium">{trip.destination}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-medium">{trip.durationDays}d / {trip.durationNights}n</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Difficulty:</span>
              <span className="font-medium">{trip.difficultyLevel}</span>
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
            {registerMutation.isPending ? "Registering..." : "Register for Trip"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
