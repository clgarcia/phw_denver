import { Link, useLocation, Switch, Route } from "wouter";
import { Button } from "@/components/ui/button";
import { Calendar, Users, ClipboardList, LayoutDashboard, Menu, ArrowLeft } from "lucide-react";
import { useState } from "react";
import AdminDashboard from "./dashboard";
import AdminEvents from "./events";
import AdminPrograms from "./programs";
import AdminRegistrations from "./registrations";

export default function AdminLayout() {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/events", label: "Events", icon: Calendar },
    { href: "/admin/programs", label: "Programs", icon: ClipboardList },
    { href: "/admin/registrations", label: "Registrations", icon: Users },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location === href;
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="flex h-14 items-center gap-4 px-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            data-testid="button-admin-menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Calendar className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">EventHub Admin</span>
          </div>
          <div className="ml-auto">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="link-back-to-site">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Site
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 transform bg-background border-r pt-14 transition-transform duration-200
          lg:relative lg:translate-x-0 lg:pt-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <nav className="flex flex-col gap-1 p-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href, item.exact) ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => setSidebarOpen(false)}
                  data-testid={`link-admin-${item.label.toLowerCase()}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </aside>

        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black/50 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-6 lg:p-8">
          <Switch>
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/admin/events" component={AdminEvents} />
            <Route path="/admin/programs" component={AdminPrograms} />
            <Route path="/admin/registrations" component={AdminRegistrations} />
          </Switch>
        </main>
      </div>
    </div>
  );
}
