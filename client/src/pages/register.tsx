import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Event, Program } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useSearch } from "wouter";
import { Calendar, CheckCircle, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;

const registrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required").regex(phoneRegex, "Phone number must be in format: 555-555-5555"),
  participationType: z.enum(["participant", "volunteer"], { required_error: "Please select a participation type" }),
  eventId: z.string().optional(),
  programId: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => data.eventId || data.programId, {
  message: "Please select an event or program",
  path: ["eventId"],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function Register() {
  const { toast } = useToast();
  const searchString = useSearch();
  const [, navigate] = useLocation();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const searchParams = new URLSearchParams(searchString);
  const preselectedEventId = searchParams.get("event") || undefined;
  const preselectedProgramId = searchParams.get("program") || undefined;
  
  const isEventRegistration = !!preselectedEventId;
  const isProgramRegistration = !!preselectedProgramId;

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: programs = [] } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
  });

  const activeEvents = events.filter(e => e.isActive && e.capacity > e.registeredCount);
  const activePrograms = programs.filter(p => p.isActive && p.capacity > p.registeredCount);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      participationType: undefined,
      eventId: preselectedEventId,
      programId: preselectedProgramId,
      notes: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      const response = await apiRequest("POST", "/api/registrations", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "You have been registered successfully. Check your email for confirmation.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      setRegistrationSuccess(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegistrationFormData) => {
    registerMutation.mutate(data);
  };

  const selectedEvent = activeEvents.find(e => e.id === form.watch("eventId"));
  const selectedProgram = activePrograms.find(p => p.id === form.watch("programId"));

  const pageTitle = isEventRegistration 
    ? "Register for Event" 
    : isProgramRegistration 
    ? "Register for Program" 
    : "Register for Events & Programs";

  const pageDescription = isEventRegistration
    ? "Fill out the form below to register for this event"
    : isProgramRegistration
    ? "Fill out the form below to register for this program"
    : "Fill out the form below to register for an upcoming event or program";

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold" data-testid="text-registration-success">Registration Complete!</h2>
              <p className="text-muted-foreground">
                Thank you for registering. You should receive a confirmation email shortly.
              </p>
              <div className="pt-4 space-y-2">
                <Button onClick={() => navigate("/")} className="w-full" data-testid="button-return-home">
                  Return to Home
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setRegistrationSuccess(false);
                    form.reset();
                  }} 
                  className="w-full"
                  data-testid="button-register-another"
                >
                  Register for Another Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/20 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold" data-testid="text-register-title">
                {pageTitle}
              </h1>
              <p className="text-muted-foreground">
                {pageDescription}
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Registration Form</CardTitle>
                  <CardDescription>
                    Please provide your information to complete registration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="John" 
                                  {...field} 
                                  data-testid="input-first-name"
                                />
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
                                <Input 
                                  placeholder="Doe" 
                                  {...field}
                                  data-testid="input-last-name"
                                />
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
                              <Input 
                                type="email" 
                                placeholder="john@example.com" 
                                {...field}
                                data-testid="input-email"
                              />
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
                              <Input 
                                type="tel" 
                                placeholder="555-555-5555" 
                                {...field}
                                data-testid="input-phone"
                              />
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
                            <FormLabel>Participation Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-participation-type">
                                  <SelectValue placeholder="Select participation type..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="participant" data-testid="option-participant">Participant</SelectItem>
                                <SelectItem value="volunteer" data-testid="option-volunteer">Volunteer</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {!isProgramRegistration && (
                        <FormField
                          control={form.control}
                          name="eventId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Select an Event</FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  if (value) form.setValue("programId", undefined);
                                }} 
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger data-testid="select-event">
                                    <SelectValue placeholder="Choose an event..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {activeEvents.length === 0 ? (
                                    <SelectItem value="none" disabled>No events available</SelectItem>
                                  ) : (
                                    activeEvents.map((event) => (
                                      <SelectItem 
                                        key={event.id} 
                                        value={event.id}
                                        data-testid={`option-event-${event.id}`}
                                      >
                                        {event.title} - {formatDate(event.date)}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {!isEventRegistration && !isProgramRegistration && (
                        <div className="text-center text-sm text-muted-foreground">— or —</div>
                      )}

                      {!isEventRegistration && (
                        <FormField
                          control={form.control}
                          name="programId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Select a Program</FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  if (value) form.setValue("eventId", undefined);
                                }} 
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger data-testid="select-program">
                                    <SelectValue placeholder="Choose a program..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {activePrograms.length === 0 ? (
                                    <SelectItem value="none" disabled>No programs available</SelectItem>
                                  ) : (
                                    activePrograms.map((program) => (
                                      <SelectItem 
                                        key={program.id} 
                                        value={program.id}
                                        data-testid={`option-program-${program.id}`}
                                      >
                                        {program.name} - {formatDate(program.startDate)}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {(selectedEvent || selectedProgram) && (
                        <Card className="bg-muted/50">
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <Calendar className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="font-medium">
                                  {selectedEvent?.title || selectedProgram?.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedEvent 
                                    ? `${formatDate(selectedEvent.date)} at ${selectedEvent.time}`
                                    : formatDate(selectedProgram?.startDate || "")
                                  }
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any special requirements or questions..."
                                className="resize-none"
                                {...field}
                                data-testid="input-notes"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full" 
                        size="lg"
                        disabled={registerMutation.isPending}
                        data-testid="button-submit-registration"
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          "Complete Registration"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
