import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Calendar, Clock, MapPin, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
function formatDate(dateString) {
    var date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
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
export default function Events() {
    var _a = useState(""), searchTerm = _a[0], setSearchTerm = _a[1];
    var _b = useQuery({
        queryKey: ["/api/events"],
    }), _c = _b.data, events = _c === void 0 ? [] : _c, isLoading = _b.isLoading;
    var activeEvents = events
        .filter(function (e) { return e.isActive; })
        .sort(function (a, b) { return new Date(a.date).getTime() - new Date(b.date).getTime(); });
    var filteredEvents = activeEvents.filter(function (event) {
        return event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.location.toLowerCase().includes(searchTerm.toLowerCase());
    });
    return (<div className="min-h-screen flex flex-col">
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground mt-2"/>
                <Input type="search" placeholder="Search events..." className="pl-10" value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} data-testid="input-search-events"/>
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
              </div>) : filteredEvents.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(function (event) { return (<Link key={event.id} href={"/events/".concat(event.id)}>
                    <Card className="group h-full hover-elevate cursor-pointer transition-all duration-200">
                      {event.imageUrl ? (<div className="h-48 rounded-t-lg overflow-hidden flex items-center justify-center bg-black/5">
                          <div className="flex items-center justify-center h-full w-full bg-white" style={{ minHeight: 192 }}>
                            <img src={event.imageUrl} alt={event.title} style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        width: "auto",
                        height: "auto",
                        display: "block",
                    }}/>
                          </div>
                        </div>) : (<div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg flex items-center justify-center">
                          <Calendar className="h-16 w-16 text-primary/40"/>
                        </div>)}
                      <CardHeader>
                        <CardTitle className="group-hover:text-primary transition-colors" data-testid={"text-event-title-".concat(event.id)}>
                          {event.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4"/>
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4"/>
                          <span>{formatTime(event.time)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4"/>
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-primary"/>
                            <span className="text-primary font-medium">
                              {event.capacity - event.registeredCount} spots left
                            </span>
                          </div>
                          <Button size="sm" variant="outline" data-testid={"button-view-event-".concat(event.id)}>
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>); })}
              </div>) : (<Card className="p-12 text-center max-w-md mx-auto">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "No events found" : "No upcoming events"}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm
                ? "Try adjusting your search terms"
                : "Check back soon for new events!"}
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
