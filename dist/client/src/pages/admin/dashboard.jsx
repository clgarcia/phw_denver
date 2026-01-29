var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, ClipboardList, Clock, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
function formatDate(dateString) {
    var date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
export default function AdminDashboard() {
    var _a = useQuery({
        queryKey: ["/api/events"],
    }), _b = _a.data, events = _b === void 0 ? [] : _b, eventsLoading = _a.isLoading;
    var _c = useQuery({
        queryKey: ["/api/programs"],
    }), _d = _c.data, programs = _d === void 0 ? [] : _d, programsLoading = _c.isLoading;
    var _e = useQuery({
        queryKey: ["/api/registrations"],
    }), _f = _e.data, registrations = _f === void 0 ? [] : _f, registrationsLoading = _e.isLoading;
    var activeEvents = events.filter(function (e) { return e.isActive; });
    var activePrograms = programs.filter(function (p) { return p.isActive; });
    var pendingRegistrations = registrations.filter(function (r) { return r.status === "pending"; });
    var confirmedRegistrations = registrations.filter(function (r) { return r.status === "confirmed"; });
    var isLoading = eventsLoading || programsLoading || registrationsLoading;
    // Combine events and programs for upcoming items
    var upcomingItems = __spreadArray(__spreadArray([], activeEvents.map(function (e) { return ({
        id: e.id,
        title: e.title,
        date: e.date,
        type: 'event',
        registeredCount: e.registeredCount,
        capacity: e.capacity,
    }); }), true), activePrograms.map(function (p) { return ({
        id: p.id,
        title: p.name,
        date: p.startDate,
        type: 'program',
        registeredCount: p.registeredCount,
        capacity: p.capacity,
    }); }), true).sort(function (a, b) { return new Date(a.date).getTime() - new Date(b.date).getTime(); }).slice(0, 4);
    var stats = [
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
    var recentRegistrations = registrations.slice(-5).reverse();
    return (<div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-admin-dashboard-title">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your events and registrations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(function (stat) { return (<Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={"p-3 rounded-lg ".concat(stat.bgColor)}>
                  <stat.icon className={"h-6 w-6 ".concat(stat.color)}/>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold" data-testid={"stat-".concat(stat.title.toLowerCase().replace(/\s/g, "-"))}>
                      {isLoading ? "..." : stat.value}
                    </span>
                    {stat.total !== undefined && (<span className="text-sm text-muted-foreground">/ {stat.total}</span>)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>); })}
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
            {registrationsLoading ? (<div className="space-y-3">
                {[1, 2, 3].map(function (i) { return (<div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-muted"/>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/2"/>
                      <div className="h-3 bg-muted rounded w-3/4"/>
                    </div>
                  </div>); })}
              </div>) : recentRegistrations.length > 0 ? (<div className="space-y-3">
                {recentRegistrations.map(function (reg) {
                var event = events.find(function (e) { return e.id === reg.eventId; });
                var program = programs.find(function (p) { return p.id === reg.programId; });
                return (<div key={reg.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50" data-testid={"registration-item-".concat(reg.id)}>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {reg.firstName.charAt(0)}{reg.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{reg.firstName} {reg.lastName}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {(event === null || event === void 0 ? void 0 : event.title) || (program === null || program === void 0 ? void 0 : program.name) || "Unknown"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {reg.status === "confirmed" ? (<span className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="h-3 w-3"/>
                            Confirmed
                          </span>) : (<span className="flex items-center gap-1 text-xs text-amber-600">
                            <Clock className="h-3 w-3"/>
                            Pending
                          </span>)}
                      </div>
                    </div>);
            })}
              </div>) : (<div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50"/>
                <p>No registrations yet</p>
              </div>)}
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
            {(eventsLoading || programsLoading) ? (<div className="space-y-3">
                {[1, 2, 3, 4].map(function (i) { return (<div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 animate-pulse">
                    <div className="h-10 w-10 rounded bg-muted"/>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/2"/>
                      <div className="h-3 bg-muted rounded w-3/4"/>
                    </div>
                  </div>); })}
              </div>) : upcomingItems.length > 0 ? (<div className="space-y-3">
                {upcomingItems.map(function (item) { return (<div key={"".concat(item.type, "-").concat(item.id)} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50" data-testid={"upcoming-item-".concat(item.type, "-").concat(item.id)}>
                    <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                      {item.type === 'event' ? (<Calendar className="h-5 w-5 text-primary"/>) : (<ClipboardList className="h-5 w-5 text-primary"/>)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(item.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.registeredCount}/{item.capacity}</p>
                      <p className="text-xs text-muted-foreground">registered</p>
                    </div>
                  </div>); })}
              </div>) : (<div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50"/>
                <p>No upcoming events or programs</p>
                <Link href="/admin/events">
                  <Button variant="ghost" size="sm" className="mt-2">
                    Create your first event
                  </Button>
                </Link>
              </div>)}
          </CardContent>
        </Card>
      </div>
    </div>);
}
