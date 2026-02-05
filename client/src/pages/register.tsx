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
import type { Event, Program, Trip } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useSearch } from "wouter";
import { Calendar, CheckCircle, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useEffect } from "react";
import { EventRegistrationForm } from "@/components/event-registration-form";
import { ProgramRegistrationForm } from "@/components/program-registration-form";
import { TripRegistrationForm } from "@/components/trip-registration-form";

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
  notes: z.string().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const JOIN_OPTIONS = [
  {
    value: "participant",
    label: "Register as a participant",
    url: "https://www.tfaforms.com/4972194",
  },
  {
    value: "volunteer",
    label: "Register as a volunteer",
    url: "https://www.tfaforms.com/4981203",
  },
  {
    value: "donate-denver",
    label: "Make a donation to the Denver Chapter",
    url: "https://donate.projecthealingwaters.org/campaign/phw-denver/c552042",
  },
  {
    value: "donate-veterans",
    label: "Make a donation to help disabled veterans across the county",
    url: "https://projecthealingwaters.org/ways-to-give/donate-now/",
  },
];

export default function Register() {
  const { toast } = useToast();
  const searchString = useSearch();
  const [, navigate] = useLocation();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [joinOption, setJoinOption] = useState<string>("");
  
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
      notes: "",
    },
  });

  // Redirect to donation URLs if selected
  useEffect(() => {
    const selected = JOIN_OPTIONS.find(opt => opt.value === joinOption);
    if (selected && selected.url) {
      window.location.href = selected.url;
    }
  }, [joinOption]);

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

  // Safely get eventId and programId from form values if present
  const formValues = form.getValues() as Record<string, unknown>;
  const selectedEventId = typeof formValues.eventId === "string" ? formValues.eventId : undefined;
  const selectedProgramId = typeof formValues.programId === "string" ? formValues.programId : undefined;
  const selectedEvent = activeEvents.find(e => e.id === selectedEventId);
  const selectedProgram = activePrograms.find(p => p.id === selectedProgramId);

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

  // If event-specific registration
  if (isEventRegistration && preselectedEventId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4">
            <EventRegistrationForm eventId={preselectedEventId} onSuccess={() => setRegistrationSuccess(true)} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If program-specific registration
  if (isProgramRegistration && preselectedProgramId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4">
            <ProgramRegistrationForm programId={preselectedProgramId} onSuccess={() => setRegistrationSuccess(true)} />
          </div>
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
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              {/* Left: Image and Join Our Program */}
              <div className="flex flex-col items-center w-full md:w-1/2">
                <img src="/assets/healing-those-who-serve.png" alt="Healing Those Who Serve" className="w-[24rem] h-[24rem] object-contain mb-12" />
                <div className="flex flex-col items-center w-full pt-8">
                  <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Join Our Program</h1>
                  <p className="text-muted-foreground mb-6 text-center">Select how you would like to get involved</p>
                  <div className="w-full max-w-md">
                    <Select value={joinOption} onValueChange={value => {
                      const selected = JOIN_OPTIONS.find(opt => opt.value === value);
                      if (selected && selected.url) {
                        window.location.replace(selected.url);
                      }
                      setJoinOption("");
                    }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose an option..." />
                      </SelectTrigger>
                      <SelectContent>
                        {JOIN_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              {/* Right: Intro Text */}
              <div className="w-full md:w-1/2 text-lg">
                <p className="mb-6">Thank you for your interest in Project Healing Waters. What do we have to offer? A healing method for the injuries we took while we served our nation, be it physical or mental. We do this through fly fishing, be it a fly-tying class, building a fly rod, learning to cast, and going out on a trip with fellow veterans.</p>
                <p className="mb-6">If you are a Veteran, and want to find the healing peace that fly fishing can bring, at no cost to you, please select the Register as a Participant option and populate the form. The Region will be Rocky mountain South, and our program is Denver.</p>
                <p className="mb-6">If want to Volunteer with the program, and help us support our hero's, as a Mentor, Coach or any of a number of other great ways, ﻿please select Register as a Volunteer option and populate the form. The Region will be Rocky mountain South, and our program is Denver.</p>
                <p className="mb-6">If you would like to donate there are two options. You can donate to the Denver Chapter or the National Project Healing Waters Organization using the dropdown options. Thank you!!</p>
              </div>
            </div>
          </div>
        </section>
        {/* No forms, just redirect on dropdown selection */}
      </main>
      <Footer />
    </div>
  );
}
