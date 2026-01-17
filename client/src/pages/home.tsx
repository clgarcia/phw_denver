import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ArrowRight, Calendar, Clock, MapPin, Users, Heart, Target, Waves } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Event, Program } from "@shared/schema";
import heroImage from "@assets/stock_images/fly_fishing_outdoor__e6919c4b.jpg";
import activityImage1 from "@assets/stock_images/fly_fishing_outdoor__104c4098.jpg";
import activityImage2 from "@assets/stock_images/fly_fishing_outdoor__02f9483b.jpg";
import volunteerImage from "@assets/stock_images/male_veterans_volunt_6db6d3fe.jpg";

export default function Home() {
  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: programs = [], isLoading: programsLoading } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
  });

  const upcomingEvents = events.filter((e: Event) => e.isActive).slice(0, 4);
  const activePrograms = programs.filter((p: Program) => p.isActive).slice(0, 4);

  const eventImages = [activityImage1, activityImage2, heroImage, activityImage1];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="relative overflow-hidden min-h-[600px] flex items-center">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white" data-testid="text-hero-title">
                Healing Through Nature, Camaraderie & Adventure
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-xl">
                Join our community programs designed to connect people through outdoor activities, 
                fly fishing, and meaningful experiences in nature.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/register">
                  <Button size="lg" className="bg-[#c73e1d]/90 hover:bg-[#c73e1d] border-[#c73e1d]/90" data-testid="button-join-program">
                    Join Our Program
                  </Button>
                </Link>
                <Link href="/events">
                  <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20" data-testid="button-volunteer">
                    Volunteer
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-mission-title">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We are the Denver Chapter of Project Healing Waters. Project Healing Waters is a nonprofit that uses 
                fly fishing as therapeutic intervention for active military and Veterans. Through our curriculum of 
                fly fishing, fly casting, fly tying, and rod building, participants experience nature's restorative 
                healing powers while building camaraderie, connectedness, and community—directly increasing their 
                sense of belonging, resilience, and post-traumatic growth. See{" "}
                <a href="https://projecthealingwaters.org" target="_blank" rel="noopener noreferrer" className="text-[#c73e1d] hover:underline">
                  projecthealingwaters.org
                </a>{" "}
                for more information.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-upcoming-events">Upcoming Events</h2>
                <p className="text-muted-foreground mt-1">Join us for upcoming activities and events</p>
              </div>
              <Link href="/events">
                <Button variant="ghost" data-testid="link-see-all-events">
                  See all <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {eventsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingEvents.map((event, index) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <Card className="group h-full hover-elevate cursor-pointer transition-all duration-200 overflow-hidden">
                      <div className="h-48 bg-muted overflow-hidden">
                        <img 
                          src={eventImages[index % eventImages.length]} 
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardHeader>
                        <div className="text-sm text-primary font-medium mb-1">{event.date}</div>
                        <CardTitle className="group-hover:text-primary transition-colors" data-testid={`text-event-title-${event.id}`}>
                          {event.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="pt-2">
                          <Button size="sm" className="w-full bg-[#c73e1d]/90 hover:bg-[#c73e1d] border-[#c73e1d]/90" data-testid={`button-register-event-${event.id}`}>
                            Register Now
                          </Button>
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
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4" data-testid="text-volunteer-section">Volunteer Opportunities</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Step into the arena and make a difference. Your involvement matters - be part of something greater.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={volunteerImage} 
                    alt="Volunteer opportunity"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>Event Volunteer</CardTitle>
                  <CardDescription>
                    Help us run our outdoor events and programs. Perfect for those who love nature and want to give back.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Assist with event setup and logistics
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Guide participants during activities
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Help create a welcoming environment
                    </li>
                  </ul>
                  <Link href="/register">
                    <Button variant="outline" className="w-full" data-testid="button-apply-volunteer">Apply Now</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={activityImage2} 
                    alt="Trip coordinator"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>Trip Coordinator</CardTitle>
                  <CardDescription>
                    Help administer our outdoor trips and adventures. This role involves coordination and participant management.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Coordinate trip logistics and schedules
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Manage participant registrations
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Communicate with team members
                    </li>
                  </ul>
                  <Link href="/register">
                    <Button variant="outline" className="w-full" data-testid="button-apply-coordinator">Apply Now</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-programs-section">Our Programs</h2>
                <p className="text-muted-foreground mt-1">Connect with our community through ongoing programs</p>
              </div>
              <Link href="/programs">
                <Button variant="ghost" data-testid="link-see-all-programs">
                  See all <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {programsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-full mt-2" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : activePrograms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <Button size="sm" className="bg-[#c73e1d]/90 hover:bg-[#c73e1d] border-[#c73e1d]/90" data-testid={`button-register-program-${program.id}`}>
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
                <Waves className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active programs</h3>
                <p className="text-muted-foreground">New programs coming soon!</p>
              </Card>
            )}
          </div>
        </section>

        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Why Join Us?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experience the transformative power of nature and community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Waves className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Outdoor Adventures</h3>
                <p className="text-muted-foreground">
                  Connect with nature through fly fishing, hiking, and wilderness experiences.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Community & Fellowship</h3>
                <p className="text-muted-foreground">
                  Build lasting connections with like-minded individuals who share your interests.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Healing & Growth</h3>
                <p className="text-muted-foreground">
                  Find peace and personal growth through meaningful outdoor experiences.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24 bg-[#c73e1d]/90 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8">
              Connect with us and start your journey. Reach out and we'll be in touch to connect you with our programs.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-[#c73e1d]" data-testid="button-cta-register">
                Join Our Program
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
