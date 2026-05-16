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
import type { Program } from "@shared/schema";
import { useState } from "react";

const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;

const programRegistrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required").regex(phoneRegex, "Phone number must be in format: 555-555-5555"),
  participationType: z.enum(["participant", "volunteer"], { 
    required_error: "Please select a participation type" 
  }),
  notes: z.string().optional(),
});

type ProgramRegistrationFormData = z.infer<typeof programRegistrationSchema>;

interface ProgramRegistrationFormProps {
  programId: string;
  onSuccess?: () => void;
}

export function ProgramRegistrationForm({ programId, onSuccess }: ProgramRegistrationFormProps) {
  const { toast } = useToast();
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState("");

  const { data: program } = useQuery<Program>({
    queryKey: ["/api/programs", programId],
  });

  // Fetch the global registration PIN from settings
  const { data: settingsData } = useQuery({
    queryKey: ["/api/settings/registration-pin"],
  });

  const globalPin = settingsData?.pin as string | undefined;

  // If Google Form URL is provided with a global PIN, show PIN verification
  if (program?.googleFormUrl && globalPin) {
    const isPinCorrect = enteredPin === globalPin;

    const handleRegisterClick = () => {
      if (!isPinCorrect) {
        setPinError("Incorrect PIN. Please try again.");
        return;
      }
      window.open(program.googleFormUrl, "_blank");
    };

    return (
      <div className="space-y-4">
        {/* Program Information Card */}
        {program && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">{program.name}</CardTitle>
            </CardHeader>
          </Card>
        )}
        
        {/* PIN Verification Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Registration</CardTitle>
            <CardDescription>Enter the PIN to register for this program</CardDescription>
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
              Register for Program
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If Google Form URL is provided without PIN, redirect immediately
  if (program?.googleFormUrl) {
    return (
      <div className="space-y-4">
        {/* Program Information Card */}
        {program && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">{program.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date:</span>
                <span className="font-medium">{new Date(program.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">End Date:</span>
                <span className="font-medium">{new Date(program.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Schedule:</span>
                <span className="font-medium">{program.schedule}</span>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="flex flex-col gap-2 pt-4">
          <a 
            href={program?.googleFormUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button className="w-full">
              Register for Program
            </Button>
          </a>
        </div>
      </div>
    );
  }

  const form = useForm<ProgramRegistrationFormData>({
    resolver: zodResolver(programRegistrationSchema),
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
    mutationFn: async (data: ProgramRegistrationFormData) => {
      const response = await apiRequest("POST", "/api/registrations", {
        ...data,
        programId,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "You have been registered successfully. Check your email for confirmation.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
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

  const onSubmit = (data: ProgramRegistrationFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="space-y-4">
      {/* Program Information Card */}
      {program && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">{program.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start Date:</span>
              <span className="font-medium">{new Date(program.startDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">End Date:</span>
              <span className="font-medium">{new Date(program.endDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Schedule:</span>
              <span className="font-medium">{program.schedule}</span>
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
            {registerMutation.isPending ? "Registering..." : "Register for Program"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
