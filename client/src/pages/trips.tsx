import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Calendar, Clock, MapPin, Users, Search, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import type { Trip } from "@shared/schema";
import { useState } from "react";
import { parseAdditionalDates } from "@/lib/additional-dates";



// Trips page displays a list of upcoming trips with search functionality

// Format a date string into a readable format (e.g., January 1, 2026)
function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format a time string (HH:mm) into 12-hour format with AM/PM
function formatTime(timeString: string): string {
  if (!timeString) return '';
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch {
    return timeString;
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

// Main component for displaying and searching trips
export default function Trips() {
  // State for search input
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch trips data from API
  const { data: trips = [], isLoading } = useQuery<Trip[]>({
    queryKey: ["/api/trips"],
  });

  // Filter and sort only active trips by date
  const activeTrips = trips
    .filter(t => t.isActive)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Filter trips based on search term (name, description, or destination)
  const filteredTrips = activeTrips.filter(trip =>
    trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getLocationSearchText(trip.destination).includes(searchTerm.toLowerCase())
  );

  // Render trips page layout
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/20 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold" data-testid="text-trips-title">
                Upcoming Trips
              </h1>
              <p className="text-muted-foreground">
                Join us for guided trips and outdoor adventures
              </p>
              <div className="relative max-w-md mx-auto pt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground mt-2" />
                <Input
                  type="search"
                  placeholder="Search trips..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-trips"
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
            ) : filteredTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrips.map((trip) => (
                  <Link key={trip.id} href={`/trips/${trip.id}`}>
                    <Card className="group h-full flex flex-col hover-elevate cursor-pointer transition-all duration-200">
                      {trip.imageUrl ? (
                        <div className="h-48 rounded-t-lg overflow-hidden flex items-center justify-center bg-white" style={{ minHeight: 192 }}>
                          <img
                            src={trip.imageUrl}
                            alt={trip.name}
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              width: "auto",
                              height: "auto",
                              display: "block",
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-t-lg flex items-center justify-center">
                          <Navigation className="h-16 w-16 text-blue-400/40" />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="group-hover:text-primary transition-colors" data-testid={`text-trip-title-${trip.id}`}>
                          {trip.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">{trip.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-grow space-y-0">
                        <div className="space-y-2 flex-grow">
                          <div className="h-6 flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-5 w-5" />
                            <span>
                              {trip.additionalDates && parseAdditionalDates(trip.additionalDates).length > 0
                                ? "Multiple dates"
                                : formatDate(trip.date)}
                            </span>
                          </div>
                          <div className="h-6 flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-5 w-5" />
                            <span>
                              {trip.additionalDates && parseAdditionalDates(trip.additionalDates).length > 0
                                ? (() => {
                                    const dates = parseAdditionalDates(trip.additionalDates);
                                    // Check if there are multiple different times
                                    const times = dates.map(d => {
                                      if (d.startTime && d.endTime) {
                                        return `${formatTime(d.startTime)}-${formatTime(d.endTime)}`;
                                      } else if (d.time) {
                                        return formatTime(d.time);
                                      }
                                      return null;
                                    }).filter(Boolean);
                                    
                                    // Check for unique times
                                    const uniqueTimes = [...new Set(times)];
                                    
                                    if (uniqueTimes.length > 1) {
                                      return "Times vary";
                                    } else if (uniqueTimes.length === 1) {
                                      return uniqueTimes[0];
                                    } else if (trip.startTime && trip.endTime) {
                                      return `${formatTime(trip.startTime)} - ${formatTime(trip.endTime)}`;
                                    }
                                    return '-';
                                  })()
                                : trip.startTime && trip.endTime ? `${formatTime(trip.startTime)} - ${formatTime(trip.endTime)}` : '-'}
                            </span>
                          </div>
                          <div className="h-12 flex gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <div className="flex flex-col min-w-0 max-h-12">
                              <span className="line-clamp-1">{getLocationNameAndAddress(trip.destination).name}</span>
                              {getLocationNameAndAddress(trip.destination).address && (
                                <span className="text-xs line-clamp-1 overflow-hidden">{getLocationNameAndAddress(trip.destination).address}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 pt-2 border-t mt-auto">
                          <Button className="w-full bg-[#c73e1d]/90 hover:bg-[#c73e1d] border-[#c73e1d]/90 text-white" size="lg" data-testid={`button-view-trip-${trip.id}`}>
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
                  {searchTerm ? "No trips found" : "No upcoming trips"}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? "Try adjusting your search terms"
                    : "Check back soon for new trips!"
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
