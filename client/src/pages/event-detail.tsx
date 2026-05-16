import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Calendar, Clock, MapPin, Users, ArrowLeft, CheckCircle, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Event } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EventRegistrationForm } from "@/components/event-registration-form";
import { PinVerificationModal } from "@/components/pin-verification-modal";
import { parseAdditionalDates, formatDate as formatDateUtil, formatTime, getEventDateDisplay } from "@/lib/additional-dates";
import { useState } from "react";


export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [urlToOpen, setUrlToOpen] = useState<string | null>(null);

  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: ["/api/events", id],
  });

  // Parse location JSON format
  const getLocationDisplay = () => {
    if (!event?.location) return { name: "", address: "" };
    try {
      return JSON.parse(event.location);
    } catch {
      // Fallback for old format
      return { name: event.location, address: "" };
    }
  };

  const locationData = getLocationDisplay();

  const spotsLeft = event ? (event.isFull ? 0 : event.capacity - event.registeredCount) : 0;
  const registeredDisplay = event ? (event.isFull ? event.capacity : event.registeredCount) : 0;
  const fillPercentage = event ? (event.isFull ? 100 : (event.registeredCount / event.capacity) * 100) : 0;

  const handleRegisterClick = () => {
    if (event?.googleFormUrl) {
      setUrlToOpen(event.googleFormUrl);
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Link href="/events">
            <Button variant="ghost" className="mb-6" data-testid="button-back-events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
          </Link>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-8">
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
          ) : error || !event ? (
            <Card className="p-12 text-center max-w-md mx-auto">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Event not found</h3>
              <p className="text-muted-foreground mb-4">
                The event you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/events">
                <Button data-testid="button-browse-events">Browse Events</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto w-full">
              <div className="space-y-6">
                <Card>
                  {event.imageUrl ? (
                    <div className="h-64 rounded-t-lg overflow-hidden flex items-center justify-center bg-black/5">
                      <div className="flex items-center justify-center h-full w-full bg-white" style={{ minHeight: 256 }}>
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            width: "auto",
                            height: "auto",
                            display: "block",
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg flex items-center justify-center">
                      <Calendar className="h-24 w-24 text-primary/40" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <CardTitle className="text-2xl md:text-3xl" data-testid="text-event-title">
                          {event.title}
                        </CardTitle>
                      </div>
                      <Badge variant={event.isActive ? "default" : "secondary"}>
                        {event.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">About This Event</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-event-description">
                        {event.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{locationData.name}</p>
                        <p className="text-sm text-muted-foreground">{locationData.address}</p>
                      </div>
                      <div className="flex gap-2 flex-col sm:flex-row">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(`${locationData.name} ${locationData.address}`)}`, '_blank')}
                          className="text-xs"
                          data-testid="button-google-maps-event"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Google Maps
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://maps.apple.com/?address=${encodeURIComponent(`${locationData.name} ${locationData.address}`)}`, '_blank')}
                          className="text-xs"
                          data-testid="button-apple-maps-event"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Apple Maps
                        </Button>
                      </div>
                    </div>

                    {event.dateRangeMode && event.dateRangeStart && event.dateRangeEnd ? (
                      <div className="pt-4 border-t space-y-3">
                        <h4 className="font-semibold text-sm">Date Range Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                            <p className="font-medium text-sm">{formatDateUtil(event.dateRangeStart)}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground mb-1">End Date</p>
                            <p className="font-medium text-sm">{formatDateUtil(event.dateRangeEnd)}</p>
                          </div>
                          {event.dateRangeStartTime && (
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground mb-1">Start Time</p>
                              <p className="font-medium text-sm">{formatTime(event.dateRangeStartTime)}</p>
                            </div>
                          )}
                          {event.dateRangeEndTime && (
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground mb-1">End Time</p>
                              <p className="font-medium text-sm">{formatTime(event.dateRangeEndTime)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : event.additionalDates && parseAdditionalDates(event.additionalDates).length > 0 ? (
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-3 text-sm">Multiple Event Dates</h4>
                        <div className="space-y-2">
                          {parseAdditionalDates(event.additionalDates).map((dateObj, index) => (
                            <div key={index} className="p-3 rounded-lg bg-muted/50">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium">{formatDateUtil(dateObj.date)}</p>
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
                      </div>
                    ) : event.date ? (
                      <div className="pt-4 border-t space-y-3">
                        <h4 className="font-semibold text-sm">Event Details</h4>
                        <div className="space-y-3">
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground mb-1">Date</p>
                            <p className="font-medium text-sm">{formatDateUtil(event.date)}</p>
                          </div>
                          {(event.startTime || event.endTime) && (
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground mb-1">Time</p>
                              <p className="font-medium text-sm">
                                {event.startTime && event.endTime 
                                  ? `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`
                                  : event.startTime 
                                  ? formatTime(event.startTime)
                                  : formatTime(event.endTime || '')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6 max-w-4xl mx-auto w-full">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Registration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">Hurry, spots fill up fast!!</p>
                    <Button 
                      className="w-full" 
                      size="lg" 
                      data-testid="button-register-event"
                      onClick={handleRegisterClick}
                    >
                      Register for This Event
                    </Button>
                  </CardContent>
                </Card>

                {event.requiresRegistration && (
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
                          <span className="text-sm">Quick setup - start immediately after registration</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                          <span className="text-sm">Connect with our community of participants</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register for Event</DialogTitle>
            <DialogDescription>
              Fill out the form below to register for {event?.title}
            </DialogDescription>
          </DialogHeader>
          {event?.id && (
            <EventRegistrationForm 
              eventId={event.id} 
              onSuccess={() => setShowRegistrationDialog(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      <PinVerificationModal
        open={showPinModal}
        onOpenChange={setShowPinModal}
        onVerified={handlePinVerified}
        registrationType="event"
      />

      <Footer />
    </div>
  );
}
