var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useSearch } from "wouter";
import { CheckCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useEffect } from "react";
function formatDate(dateString) {
    if (!dateString)
        return "";
    var date = new Date(dateString);
    if (isNaN(date.getTime()))
        return "";
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
var phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
var registrationSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required").regex(phoneRegex, "Phone number must be in format: 555-555-5555"),
    notes: z.string().optional(),
});
var JOIN_OPTIONS = [
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
    var _this = this;
    var toast = useToast().toast;
    var searchString = useSearch();
    var _a = useLocation(), navigate = _a[1];
    var _b = useState(false), registrationSuccess = _b[0], setRegistrationSuccess = _b[1];
    var _c = useState(""), joinOption = _c[0], setJoinOption = _c[1];
    var searchParams = new URLSearchParams(searchString);
    var preselectedEventId = searchParams.get("event") || undefined;
    var preselectedProgramId = searchParams.get("program") || undefined;
    var isEventRegistration = !!preselectedEventId;
    var isProgramRegistration = !!preselectedProgramId;
    var _d = useQuery({
        queryKey: ["/api/events"],
    }).data, events = _d === void 0 ? [] : _d;
    var _e = useQuery({
        queryKey: ["/api/programs"],
    }).data, programs = _e === void 0 ? [] : _e;
    var activeEvents = events.filter(function (e) { return e.isActive && e.capacity > e.registeredCount; });
    var activePrograms = programs.filter(function (p) { return p.isActive && p.capacity > p.registeredCount; });
    var form = useForm({
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
    useEffect(function () {
        var selected = JOIN_OPTIONS.find(function (opt) { return opt.value === joinOption; });
        if (selected && selected.url) {
            window.location.href = selected.url;
        }
    }, [joinOption]);
    var registerMutation = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/registrations", data)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            toast({
                title: "Registration Successful!",
                description: "You have been registered successfully. Check your email for confirmation.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/events"] });
            queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
            setRegistrationSuccess(true);
        },
        onError: function (error) {
            toast({
                title: "Registration Failed",
                description: error.message || "Something went wrong. Please try again.",
                variant: "destructive",
            });
        },
    });
    var onSubmit = function (data) {
        registerMutation.mutate(data);
    };
    // Safely get eventId and programId from form values if present
    var formValues = form.getValues();
    var selectedEventId = typeof formValues.eventId === "string" ? formValues.eventId : undefined;
    var selectedProgramId = typeof formValues.programId === "string" ? formValues.programId : undefined;
    var selectedEvent = activeEvents.find(function (e) { return e.id === selectedEventId; });
    var selectedProgram = activePrograms.find(function (p) { return p.id === selectedProgramId; });
    var pageTitle = isEventRegistration
        ? "Register for Event"
        : isProgramRegistration
            ? "Register for Program"
            : "Register for Events & Programs";
    var pageDescription = isEventRegistration
        ? "Fill out the form below to register for this event"
        : isProgramRegistration
            ? "Fill out the form below to register for this program"
            : "Fill out the form below to register for an upcoming event or program";
    if (registrationSuccess) {
        return (<div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400"/>
              </div>
              <h2 className="text-2xl font-bold" data-testid="text-registration-success">Registration Complete!</h2>
              <p className="text-muted-foreground">
                Thank you for registering. You should receive a confirmation email shortly.
              </p>
              <div className="pt-4 space-y-2">
                <Button onClick={function () { return navigate("/"); }} className="w-full" data-testid="button-return-home">
                  Return to Home
                </Button>
                <Button variant="outline" onClick={function () {
                setRegistrationSuccess(false);
                form.reset();
            }} className="w-full" data-testid="button-register-another">
                  Register for Another Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>);
    }
    return (<div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/20 py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              {/* Left: Image and Join Our Program */}
              <div className="flex flex-col items-center w-full md:w-1/2">
                <img src="/assets/healing-those-who-serve.png" alt="Healing Those Who Serve" className="w-[24rem] h-[24rem] object-contain mb-12"/>
                <div className="flex flex-col items-center w-full pt-8">
                  <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Join Our Program</h1>
                  <p className="text-muted-foreground mb-6 text-center">Select how you would like to get involved</p>
                  <div className="w-full max-w-md">
                    <Select value={joinOption} onValueChange={function (value) {
            var selected = JOIN_OPTIONS.find(function (opt) { return opt.value === value; });
            if (selected && selected.url) {
                window.location.replace(selected.url);
            }
            setJoinOption("");
        }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose an option..."/>
                      </SelectTrigger>
                      <SelectContent>
                        {JOIN_OPTIONS.map(function (opt) { return (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>); })}
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
    </div>);
}
