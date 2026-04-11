import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Calendar, Clock, MapPin, Users, ArrowLeft, Navigation, Gauge, ExternalLink, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Trip } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TripRegistrationForm } from "@/components/trip-registration-form";
import { PinVerificationModal } from "@/components/pin-verification-modal";
import { parseAdditionalDates, formatDate, formatTime } from "@/lib/additional-dates";
import { useState } from "react";


// TripDetail page displays detailed information about a specific trip

// Main component for displaying trip details
export default function TripDetail() {
  // Get trip ID from URL params
  const { id } = useParams<{ id: string }>();
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [urlToOpen, setUrlToOpen] = useState<string | null>(null);

  // Fetch trip data from API
  const { data: trip, isLoading, error } = useQuery<Trip>({
    queryKey: ["/api/trips", id],
  });

  // Helper to parse location JSON format
  const parseLocation = (location: string | undefined): { name: string; address: string } => {
    if (!location) return { name: "", address: "" };
    try {
      return JSON.parse(location);
    } catch {
      // Fallback - it's just a plain string
      return { name: location, address: "" };
    }
  };

  const destinationData = parseLocation(trip?.destination);

  // Calculate registration display for the trip
  const registeredDisplay = trip ? trip.registeredCount : 0;
  const spotsLeft = 0; // No longer tracking capacity
  const fillPercentage = 0; // No longer tracking capacity

  const handleRegisterClick = () => {
    if (trip?.googleFormUrl) {
      setUrlToOpen(trip.googleFormUrl);
      setShowPinModal(true);
    } else {
      setShowRegistrationDialog(true);
    }
  };

  const handlePinVerified = () => {
    if (urlToOpen) {
      window.open(urlToOpen, "_blank");
      setUrlToOpen(null);
    }
  };

  // Render trip detail page layout
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Back button to trips list */}
          <Link href="/trips">
            <Button variant="ghost" className="mb-6" data-testid="button-back-trips">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Trips
            </Button>
          </Link>

          {isLoading ? (
            <div className="space-y-6 max-w-4xl mx-auto w-full">
              <div>
                <Card className="animate-pulse">
                  <div className="h-64 bg-muted rounded-t-lg" />
                  <CardHeader>
                    <div className="h-8 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full mt-4" />
                    <div className="h-4 bg-muted rounded w-2/3 mt-2" />
                  </CardHeader>
                </Card>
              </div>
              <div>
                <Card className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-10 bg-muted rounded" />
                    <div className="h-10 bg-muted rounded" />
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : error || !trip ? (
            <Card className="p-12 text-center max-w-md mx-auto">
              <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Trip not found</h3>
              <p className="text-muted-foreground mb-4">
                The trip you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/trips">
                <Button data-testid="button-browse-trips">Browse Trips</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto w-full">
              <div className="space-y-6">
                <Card>
                  {trip.imageUrl ? (
                    <div className="h-64 rounded-t-lg overflow-hidden flex items-center justify-center bg-white">
                      <img
                        src={trip.imageUrl}
                        alt={trip.name}
                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
                      />
                    </div>
                  ) : (
                    <div className="h-64 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-t-lg flex items-center justify-center">
                      <Navigation className="h-24 w-24 text-blue-400/40" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <CardTitle className="text-2xl md:text-3xl" data-testid="text-trip-title">
                          {trip.name}
                        </CardTitle>
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



                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 flex-wrap">
                      <Navigation className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-medium">{destinationData.name || "Destination"}</p>
                        {destinationData.address && <p className="text-sm text-muted-foreground">{destinationData.address}</p>}
                      </div>
                      <div className="flex gap-2 flex-col sm:flex-row ml-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(destinationData.address)}`, '_blank')}
                          className="text-xs"
                          data-testid="button-google-maps-destination"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Google Maps
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://maps.apple.com/?address=${encodeURIComponent(destinationData.address)}`, '_blank')}
                          className="text-xs"
                          data-testid="button-apple-maps-destination"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Apple Maps
                        </Button>
                      </div>
                    </div>

                    {!trip.dateRangeMode ? (
                      <div className="pt-4 border-t space-y-3">
                        <h4 className="font-semibold text-sm">Trip Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {trip.date === trip.endDate ? (
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground mb-1">Date</p>
                              <p className="font-medium text-sm">{formatDate(trip.date)}</p>
                            </div>
                          ) : (
                            <>
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                                <p className="font-medium text-sm">{formatDate(trip.date)}</p>
                              </div>
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground mb-1">End Date</p>
                                <p className="font-medium text-sm">{formatDate(trip.endDate)}</p>
                              </div>
                            </>
                          )}
                          {trip.startTime && trip.endTime ? (
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground mb-1">Time</p>
                              <p className="font-medium text-sm">{formatTime(trip.startTime)} - {formatTime(trip.endTime)}</p>
                            </div>
                          ) : trip.startTime ? (
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground mb-1">Start Time</p>
                              <p className="font-medium text-sm">{formatTime(trip.startTime)}</p>
                            </div>
                          ) : null}
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground mb-1">Duration</p>
                            <p className="font-medium text-sm">{trip.durationDays}d / {trip.durationNights}n</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground mb-1">Difficulty</p>
                            <p className="font-medium text-sm">{trip.difficultyLevel}</p>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {trip.dateRangeMode && trip.dateRangeStart && trip.dateRangeEnd ? (
                      <div className="pt-4 border-t space-y-3">
                        <h4 className="font-semibold text-sm">Date Range Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {trip.dateRangeStart === trip.dateRangeEnd ? (
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground mb-1">Date</p>
                              <p className="font-medium text-sm">{formatDate(trip.dateRangeStart)}</p>
                            </div>
                          ) : (
                            <>
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                                <p className="font-medium text-sm">{formatDate(trip.dateRangeStart)}</p>
                              </div>
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground mb-1">End Date</p>
                                <p className="font-medium text-sm">{formatDate(trip.dateRangeEnd)}</p>
                              </div>
                            </>
                          )}
                          {trip.dateRangeStartTime && (
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground mb-1">Start Time</p>
                              <p className="font-medium text-sm">{formatTime(trip.dateRangeStartTime)}</p>
                            </div>
                          )}
                          {trip.dateRangeEndTime && (
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground mb-1">End Time</p>
                              <p className="font-medium text-sm">{formatTime(trip.dateRangeEndTime)}</p>
                            </div>
                          )}
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground mb-1">Duration</p>
                            <p className="font-medium text-sm">{trip.durationDays}d / {trip.durationNights}n</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground mb-1">Difficulty</p>
                            <p className="font-medium text-sm">{trip.difficultyLevel}</p>
                          </div>
                        </div>
                      </div>
                    ) : trip.additionalDates && parseAdditionalDates(trip.additionalDates).length > 0 ? (
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-3 text-sm">Multiple Trip Dates</h4>
                        <div className="space-y-2">
                          {parseAdditionalDates(trip.additionalDates).map((dateObj, index) => (
                            <div key={index} className="p-3 rounded-lg bg-muted/50">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium">{formatDate(dateObj.date)}</p>
                                  {dateObj.startTime && dateObj.endTime ? (
                                    <p className="font-medium text-xs mt-1">{formatTime(dateObj.startTime)} - {formatTime(dateObj.endTime)}</p>
                                  ) : dateObj.startTime ? (
                                    <p className="font-medium text-xs mt-1">{formatTime(dateObj.startTime)}</p>
                                  ) : dateObj.time ? (
                                    <p className="font-medium text-xs mt-1">{formatTime(dateObj.time)}</p>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="pt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground mb-1">Duration</p>
                            <p className="font-medium text-sm">{trip.durationDays}d / {trip.durationNights}n</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground mb-1">Difficulty</p>
                            <p className="font-medium text-sm">{trip.difficultyLevel}</p>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {trip.tripCoordinatorNames && (
                      <div>
                        <h3 className="font-semibold mb-2">Trip Coordinators</h3>
                        <p className="text-muted-foreground">{trip.tripCoordinatorNames}</p>
                      </div>
                    )}

                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6 max-w-4xl mx-auto w-full">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Registration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {trip?.isFull ? (
                      <>
                        <p className="text-destructive font-semibold">This trip is full</p>
                        <Button 
                          className="w-full" 
                          data-testid={`button-register-trip-${trip.id}`}
                          size="lg"
                          disabled
                          variant="secondary"
                        >
                          Event Full
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-muted-foreground">Hurry, spots fill up fast!!</p>
                        <Button 
                          className="w-full" 
                          data-testid={`button-register-trip-${trip.id}`}
                          size="lg"
                          onClick={handleRegisterClick}
                        >
                          Register for This Trip
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What to Expect</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <span className="text-sm">Easy online registration</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <span className="text-sm">Pre-trip planning and preparation</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <span className="text-sm">Unforgettable outdoor adventure with our community</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register for Trip</DialogTitle>
            <DialogDescription>
              Fill out the form below to register for {trip?.name}
            </DialogDescription>
          </DialogHeader>
          {trip?.id && (
            <TripRegistrationForm 
              tripId={trip.id} 
              onSuccess={() => setShowRegistrationDialog(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
      <PinVerificationModal
        open={showPinModal}
        onOpenChange={setShowPinModal}
        onVerified={handlePinVerified}
        registrationType="trip"
      />
      <Footer />
    </div>
  );
}
