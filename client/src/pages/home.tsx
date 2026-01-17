import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ArrowRight, Calendar, Clock, MapPin, Users, CheckCircle, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Event, Program } from "@shared/schema";

export default function Home() {
  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: programs = [], isLoading: programsLoading } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
  });

  const upcomingEvents = events.filter(e => e.isActive).slice(0, 3);
  const activePrograms = programs.filter(p => p.isActive).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/20 py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight" data-testid="text-hero-title">
                Discover Amazing Events & Programs
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Join our community events and programs. From workshops to celebrations, 
                we bring people together for memorable experiences.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Link href="/events">
                  <Button size="lg" data-testid="button-view-events">
                    View Events
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" data-testid="button-register-now">
                    Register Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(circle_at_50%_120%,rgba(37,99,235,0.1),transparent_50%)]" />
        </section>

        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-upcoming-events">Upcoming Events</h2>
                <p className="text-muted-foreground mt-1">Don't miss out on these exciting events</p>
              </div>
              <Link href="/events">
                <Button variant="ghost" data-testid="link-see-all-events">
                  See all <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {eventsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg" />
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <Card className="group h-full hover-elevate cursor-pointer transition-all duration-200">
                      <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg flex items-center justify-center">
                        <Calendar className="h-16 w-16 text-primary/40" />
                      </div>
                      <CardHeader>
                        <CardTitle className="group-hover:text-primary transition-colors" data-testid={`text-event-title-${event.id}`}>
                          {event.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-primary font-medium">
                            {event.capacity - event.registeredCount} spots left
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
                <p className="text-muted-foreground">Check back soon for new events!</p>
              </Card>
            )}
          </div>
        </section>

        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-programs-section">Our Programs</h2>
                <p className="text-muted-foreground mt-1">Ongoing programs you can join</p>
              </div>
              <Link href="/programs">
                <Button variant="ghost" data-testid="link-see-all-programs">
                  See all <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {programsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-full mt-2" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : activePrograms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activePrograms.map((program) => (
                  <Card key={program.id} className="h-full hover-elevate transition-all duration-200">
                    <CardHeader>
                      <CardTitle data-testid={`text-program-name-${program.id}`}>{program.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{program.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{program.startDate} - {program.endDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{program.schedule}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-lg font-bold text-primary">${program.price}</span>
                        <Link href={`/register?program=${program.id}`}>
                          <Button size="sm" data-testid={`button-register-program-${program.id}`}>
                            Register
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active programs</h3>
                <p className="text-muted-foreground">New programs coming soon!</p>
              </Card>
            )}
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Why Choose EventHub?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We make event participation and program registration simple and enjoyable
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Easy Registration</h3>
                <p className="text-muted-foreground">
                  Sign up for events and programs in just a few clicks. No complicated forms.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Community Focused</h3>
                <p className="text-muted-foreground">
                  Join a vibrant community of participants. Connect and grow together.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Quality Programs</h3>
                <p className="text-muted-foreground">
                  Carefully curated events and programs designed for meaningful experiences.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Browse our upcoming events and programs, and register today to be part of something amazing.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" data-testid="button-cta-register">
                Register Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
