import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Calendar, Clock, MapPin, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import type { Event } from "@shared/schema";
import { useState } from "react";

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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

function getLocationDisplay(location: string): string {
  if (!location) return '';
  try {
    const data = JSON.parse(location);
    return `${data.name}, ${data.address}`;
  } catch {
    // Fallback for old format
    return location;
  }
}

function getLocationNameAndAddress(location: string): { name: string; address: string } {
  if (!location) return { name: '', address: '' };
  try {
    const data = JSON.parse(location);
    return { name: data.name || '', address: data.address || '' };
  } catch {
    // Fallback for old format
    return { name: location, address: '' };
  }
}

function getLocationSearchText(location: string): string {
  if (!location) return '';
  try {
    const data = JSON.parse(location);
    return `${data.name} ${data.address}`.toLowerCase();
  } catch {
    // Fallback for old format
    return location.toLowerCase();
  }
}

export default function Events() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const activeEvents = events
    .filter(e => e.isActive)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const filteredEvents = activeEvents.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getLocationSearchText(event.location).includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/20 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold" data-testid="text-events-title">
                Upcoming Events
              </h1>
              <p className="text-muted-foreground">
                Discover and register for our upcoming community events
              </p>
              <div className="relative max-w-md mx-auto pt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground mt-2" />
                <Input
                  type="search"
                  placeholder="Search events..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-events"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg" />
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted rounded w-full mb-2" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <Card className="group h-full hover-elevate cursor-pointer transition-all duration-200 flex flex-col">
                      {event.imageUrl ? (
                        <div className="h-48 rounded-t-lg overflow-hidden flex items-center justify-center bg-black/5">
                          <div className="flex items-center justify-center h-full w-full bg-white" style={{ minHeight: 192 }}>
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
                        <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg flex items-center justify-center">
                          <Calendar className="h-16 w-16 text-primary/40" />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="group-hover:text-primary transition-colors" data-testid={`text-event-title-${event.id}`}>
                          {event.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-grow space-y-0">
                        <div className="space-y-2 flex-grow">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-5 w-5" />
                            <span>
                              {event.dateRangeMode || (event.additionalDates && JSON.parse(event.additionalDates).length > 0)
                                ? "Multiple Days"
                                : event.date
                                ? formatDate(event.date)
                                : "Date TBA"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-5 w-5" />
                            {event.dateRangeMode || (event.additionalDates && JSON.parse(event.additionalDates).length > 0) ? (
                              <span>Times vary</span>
                            ) : (
                              <span>
                                {event.startTime && event.endTime 
                                  ? `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`
                                  : event.startTime 
                                  ? formatTime(event.startTime)
                                  : event.time 
                                  ? formatTime(event.time)
                                  : 'Time TBA'}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-5 w-5 flex-shrink-0" />
                            <div className="flex flex-col">
                              <span>{getLocationNameAndAddress(event.location).name}</span>
                              {getLocationNameAndAddress(event.location).address && (
                                <span className="text-xs">{getLocationNameAndAddress(event.location).address}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 pt-2 border-t mt-auto">
                          <Button className="w-full bg-[#c73e1d]/90 hover:bg-[#c73e1d] border-[#c73e1d]/90 text-white" size="sm" data-testid={`button-view-event-${event.id}`}>
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center max-w-md mx-auto">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "No events found" : "No upcoming events"}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? "Try adjusting your search terms"
                    : "Check back soon for new events!"
                  }
                </p>
                {searchTerm && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSearchTerm("")}
                    data-testid="button-clear-search"
                  >
                    Clear Search
                  </Button>
                )}
              </Card>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
