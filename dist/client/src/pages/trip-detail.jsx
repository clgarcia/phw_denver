import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Calendar, Clock, MapPin, ArrowLeft, Navigation, Gauge } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
// TripDetail page displays detailed information about a specific trip
// Format a date string into a readable format (e.g., Jan 1, 2026)
function formatDate(dateString) {
    var date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
// Format a time string (HH:mm) into 12-hour format with AM/PM
function formatTime(timeString) {
    if (!timeString)
        return '';
    try {
        var _a = timeString.split(':').map(Number), hours = _a[0], minutes = _a[1];
        var period = hours >= 12 ? 'PM' : 'AM';
        var displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        return "".concat(displayHours, ":").concat(minutes.toString().padStart(2, '0'), " ").concat(period);
    }
    catch (_b) {
        return timeString;
    }
}
// Main component for displaying trip details
export default function TripDetail() {
    // Get trip ID from URL params
    var id = useParams().id;
    // Fetch trip data from API
    var _a = useQuery({
        queryKey: ["/api/trips", id],
    }), trip = _a.data, isLoading = _a.isLoading, error = _a.error;
    // Calculate spots left and fill percentage for the trip
    var spotsLeft = trip ? trip.capacity - trip.registeredCount : 0;
    var fillPercentage = trip ? (trip.registeredCount / trip.capacity) * 100 : 0;
    // Render trip detail page layout
    return (<div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Back button to trips list */}
          <Link href="/trips">
            <Button variant="ghost" className="mb-6" data-testid="button-back-trips">
              <ArrowLeft className="mr-2 h-4 w-4"/>
              Back to Trips
            </Button>
          </Link>

          {isLoading ? (<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="animate-pulse">
                  <div className="h-64 bg-muted rounded-t-lg"/>
                  <CardHeader>
                    <div className="h-8 bg-muted rounded w-3/4"/>
                    <div className="h-4 bg-muted rounded w-full mt-4"/>
                    <div className="h-4 bg-muted rounded w-2/3 mt-2"/>
                  </CardHeader>
                </Card>
              </div>
              <div>
                <Card className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-1/2"/>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-10 bg-muted rounded"/>
                    <div className="h-10 bg-muted rounded"/>
                  </CardContent>
                </Card>
              </div>
            </div>) : error || !trip ? (<Card className="p-12 text-center max-w-md mx-auto">
              <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
              <h3 className="text-lg font-semibold mb-2">Trip not found</h3>
              <p className="text-muted-foreground mb-4">
                The trip you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/trips">
                <Button data-testid="button-browse-trips">Browse Trips</Button>
              </Link>
            </Card>) : (<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  {trip.imageUrl ? (<div className="h-64 rounded-t-lg overflow-hidden flex items-center justify-center bg-white">
                      <img src={trip.imageUrl} alt={trip.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}/>
                    </div>) : (<div className="h-64 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-t-lg flex items-center justify-center">
                      <Navigation className="h-24 w-24 text-blue-400/40"/>
                    </div>)}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <CardTitle className="text-2xl md:text-3xl" data-testid="text-trip-title">
                          {trip.name}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {formatDate(trip.date)} - {formatDate(trip.endDate)} • {formatTime(trip.time)} - {formatTime(trip.endTime)}
                        </CardDescription>
                      </div>
                      <Badge variant={trip.isActive ? "default" : "secondary"}>
                        {trip.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">About This Trip</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-trip-description">
                        {trip.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <Calendar className="h-5 w-5 text-primary"/>
                        <div>
                          <p className="text-sm text-muted-foreground">Start Date</p>
                          <p className="font-medium">{formatDate(trip.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <Calendar className="h-5 w-5 text-primary"/>
                        <div>
                          <p className="text-sm text-muted-foreground">End Date</p>
                          <p className="font-medium">{formatDate(trip.endDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <Clock className="h-5 w-5 text-primary"/>
                        <div>
                          <p className="text-sm text-muted-foreground">Time</p>
                          <p className="font-medium">{formatTime(trip.time)} - {formatTime(trip.endTime)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <MapPin className="h-5 w-5 text-primary"/>
                        <div>
                          <p className="text-sm text-muted-foreground">Meetup Location</p>
                          <p className="font-medium">{trip.meetupLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <Navigation className="h-5 w-5 text-primary"/>
                        <div>
                          <p className="text-sm text-muted-foreground">Destination</p>
                          <p className="font-medium">{trip.destination}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <Calendar className="h-5 w-5 text-primary"/>
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="font-medium">{trip.durationDays}d / {trip.durationNights}n</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <Gauge className="h-5 w-5 text-primary"/>
                        <div>
                          <p className="text-sm text-muted-foreground">Difficulty</p>
                          <p className="font-medium">{trip.difficultyLevel}</p>
                        </div>
                      </div>
                    </div>

                    {trip.tripCoordinatorNames && (<div>
                        <h3 className="font-semibold mb-2">Trip Coordinators</h3>
                        <p className="text-muted-foreground">{trip.tripCoordinatorNames}</p>
                      </div>)}

                    {trip.volunteerNames && (<div>
                        <h3 className="font-semibold mb-2">Volunteers</h3>
                        <p className="text-muted-foreground">{trip.volunteerNames}</p>
                      </div>)}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <Card className="sticky top-20">
                  <CardHeader>
                    <CardTitle>Registration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Spots Available</span>
                        <span className="text-sm font-medium text-primary">{spotsLeft} / {trip.capacity}</span>
                      </div>
                      <Progress value={fillPercentage} className="h-2"/>
                    </div>

                    {spotsLeft > 0 ? (<Link href="/register">
                        <Button className="w-full" data-testid={"button-register-trip-".concat(trip.id)} size="lg">
                          Register for Trip
                        </Button>
                      </Link>) : (<Button disabled className="w-full" data-testid="button-trip-full" size="lg">
                        Trip is Full
                      </Button>)}

                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Fill out the registration form and select this trip as your registration type.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>)}
        </div>
      </main>

      <Footer />
    </div>);
}
