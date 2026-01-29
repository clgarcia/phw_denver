import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Calendar, Clock, MapPin, Users, Search, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
// Trips page displays a list of upcoming trips with search functionality
// Format a date string into a readable format (e.g., January 1, 2026)
function formatDate(dateString) {
    var date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
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
// Main component for displaying and searching trips
export default function Trips() {
    // State for search input
    var _a = useState(""), searchTerm = _a[0], setSearchTerm = _a[1];
    // Fetch trips data from API
    var _b = useQuery({
        queryKey: ["/api/trips"],
    }), _c = _b.data, trips = _c === void 0 ? [] : _c, isLoading = _b.isLoading;
    // Filter and sort only active trips by date
    var activeTrips = trips
        .filter(function (t) { return t.isActive; })
        .sort(function (a, b) { return new Date(a.date).getTime() - new Date(b.date).getTime(); });
    // Filter trips based on search term (name, description, or destination)
    var filteredTrips = activeTrips.filter(function (trip) {
        return trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trip.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trip.destination.toLowerCase().includes(searchTerm.toLowerCase());
    });
    // Render trips page layout
    return (<div className="min-h-screen flex flex-col">
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground mt-2"/>
                <Input type="search" placeholder="Search trips..." className="pl-10" value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} data-testid="input-search-trips"/>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(function (i) { return (<Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg"/>
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4"/>
                      <div className="h-4 bg-muted rounded w-1/2 mt-2"/>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted rounded w-full mb-2"/>
                      <div className="h-4 bg-muted rounded w-2/3"/>
                    </CardContent>
                  </Card>); })}
              </div>) : filteredTrips.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrips.map(function (trip) { return (<Link key={trip.id} href={"/trips/".concat(trip.id)}>
                    <Card className="group h-full hover-elevate cursor-pointer transition-all duration-200">
                      {trip.imageUrl ? (<div className="h-48 rounded-t-lg overflow-hidden flex items-center justify-center bg-white" style={{ minHeight: 192 }}>
                          <img src={trip.imageUrl} alt={trip.name} style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        width: "auto",
                        height: "auto",
                        display: "block",
                    }}/>
                        </div>) : (<div className="h-48 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-t-lg flex items-center justify-center">
                          <Navigation className="h-16 w-16 text-blue-400/40"/>
                        </div>)}
                      <CardHeader>
                        <CardTitle className="group-hover:text-primary transition-colors" data-testid={"text-trip-title-".concat(trip.id)}>
                          {trip.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">{trip.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4"/>
                          <span>{formatDate(trip.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4"/>
                          <span>{formatTime(trip.time)} - {formatTime(trip.endTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4"/>
                          <span>{trip.destination}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-primary"/>
                            <span className="text-primary font-medium">
                              {trip.capacity - trip.registeredCount} spots left
                            </span>
                          </div>
                          <Button size="sm" variant="outline" data-testid={"button-view-trip-".concat(trip.id)}>
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>); })}
              </div>) : (<Card className="p-12 text-center max-w-md mx-auto">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "No trips found" : "No upcoming trips"}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm
                ? "Try adjusting your search terms"
                : "Check back soon for new trips!"}
                </p>
                {searchTerm && (<Button variant="outline" className="mt-4" onClick={function () { return setSearchTerm(""); }} data-testid="button-clear-search">
                    Clear Search
                  </Button>)}
              </Card>)}
          </div>
        </section>
      </main>

      <Footer />
    </div>);
}
