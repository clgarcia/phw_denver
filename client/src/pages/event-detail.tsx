import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Calendar, Clock, MapPin, Users, ArrowLeft, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Event } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: ["/api/events", id],
  });

  const spotsLeft = event ? event.capacity - event.registeredCount : 0;
  const fillPercentage = event ? (event.registeredCount / event.capacity) * 100 : 0;

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <div className="h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg flex items-center justify-center">
                    <Calendar className="h-24 w-24 text-primary/40" />
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <CardTitle className="text-2xl md:text-3xl" data-testid="text-event-title">
                          {event.title}
                        </CardTitle>
                        <CardDescription className="mt-2">{event.date} at {event.time}</CardDescription>
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-medium">{event.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Time</p>
                          <p className="font-medium">{event.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">{event.location}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Registration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Capacity</span>
                        <span className="font-medium">{event.registeredCount} / {event.capacity}</span>
                      </div>
                      <Progress value={fillPercentage} className="h-2" />
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-primary">{spotsLeft} spots remaining</p>
                        <p className="text-sm text-muted-foreground">
                          {fillPercentage > 80 ? "Filling up fast!" : "Spots available"}
                        </p>
                      </div>
                    </div>

                    {spotsLeft > 0 ? (
                      <Link href={`/register?event=${event.id}`}>
                        <Button className="w-full" size="lg" data-testid="button-register-event">
                          Register for This Event
                        </Button>
                      </Link>
                    ) : (
                      <Button className="w-full" size="lg" disabled>
                        Event Full
                      </Button>
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
                        <span className="text-sm">Confirmation email sent immediately</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <span className="text-sm">Reminder before the event</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
