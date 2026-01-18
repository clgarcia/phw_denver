import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, ClipboardList, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Event, Program, Registration } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export default function AdminDashboard() {
  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: programs = [], isLoading: programsLoading } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
  });

  const { data: registrations = [], isLoading: registrationsLoading } = useQuery<Registration[]>({
    queryKey: ["/api/registrations"],
  });

  const activeEvents = events.filter(e => e.isActive);
  const activePrograms = programs.filter(p => p.isActive);
  const pendingRegistrations = registrations.filter(r => r.status === "pending");
  const confirmedRegistrations = registrations.filter(r => r.status === "confirmed");

  const isLoading = eventsLoading || programsLoading || registrationsLoading;

  // Combine events and programs for upcoming items
  const upcomingItems = [
    ...activeEvents.map(e => ({
      id: e.id,
      title: e.title,
      date: e.date,
      type: 'event' as const,
      registeredCount: e.registeredCount,
      capacity: e.capacity,
    })),
    ...activePrograms.map(p => ({
      id: p.id,
      title: p.name,
      date: p.startDate,
      type: 'program' as const,
      registeredCount: p.registeredCount,
      capacity: p.capacity,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 4);

  const stats = [
    {
      title: "Active Events",
      value: activeEvents.length,
      total: events.length,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Active Programs",
      value: activePrograms.length,
      total: programs.length,
      icon: ClipboardList,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "Total Registrations",
      value: registrations.length,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Pending Reviews",
      value: pendingRegistrations.length,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
  ];

  const recentRegistrations = registrations.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-admin-dashboard-title">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your events and registrations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold" data-testid={`stat-${stat.title.toLowerCase().replace(/\s/g, "-")}`}>
                      {isLoading ? "..." : stat.value}
                    </span>
                    {stat.total !== undefined && (
                      <span className="text-sm text-muted-foreground">/ {stat.total}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Recent Registrations</CardTitle>
              <CardDescription>Latest signups for your events and programs</CardDescription>
            </div>
            <Link href="/admin/registrations">
              <Button variant="outline" size="sm" data-testid="link-view-all-registrations">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {registrationsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentRegistrations.length > 0 ? (
              <div className="space-y-3">
                {recentRegistrations.map((reg) => {
                  const event = events.find(e => e.id === reg.eventId);
                  const program = programs.find(p => p.id === reg.programId);
                  
                  return (
                    <div 
                      key={reg.id} 
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      data-testid={`registration-item-${reg.id}`}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {reg.firstName.charAt(0)}{reg.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{reg.firstName} {reg.lastName}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {event?.title || program?.name || "Unknown"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {reg.status === "confirmed" ? (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Confirmed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-amber-600">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No registrations yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Upcoming Events & Programs</CardTitle>
              <CardDescription>Events and programs happening soon</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {(eventsLoading || programsLoading) ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 animate-pulse">
                    <div className="h-10 w-10 rounded bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingItems.length > 0 ? (
              <div className="space-y-3">
                {upcomingItems.map((item) => (
                  <div 
                    key={`${item.type}-${item.id}`} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    data-testid={`upcoming-item-${item.type}-${item.id}`}
                  >
                    <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                      {item.type === 'event' ? (
                        <Calendar className="h-5 w-5 text-primary" />
                      ) : (
                        <ClipboardList className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(item.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.registeredCount}/{item.capacity}</p>
                      <p className="text-xs text-muted-foreground">registered</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No upcoming events or programs</p>
                <Link href="/admin/events">
                  <Button variant="ghost" size="sm" className="mt-2">
                    Create your first event
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
