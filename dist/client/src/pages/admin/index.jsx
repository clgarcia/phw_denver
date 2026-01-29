import { Link, useLocation, Switch, Route } from "wouter";
import { Button } from "@/components/ui/button";
import { Calendar, Users, ClipboardList, LayoutDashboard, Menu, Navigation, LogOut } from "lucide-react";
var flagFish = "/assets/flag-fish.png";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import AdminDashboard from "./dashboard";
import AdminEvents from "./events";
import AdminPrograms from "./programs";
import AdminTrips from "./trips";
import AdminRegistrations from "./registrations";
export default function AdminLayout() {
    var _a = useLocation(), location = _a[0], navigate = _a[1];
    var logout = useAuth().logout;
    var _b = useState(false), sidebarOpen = _b[0], setSidebarOpen = _b[1];
    var navItems = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
        { href: "/admin/events", label: "Events", icon: Calendar },
        { href: "/admin/programs", label: "Programs", icon: ClipboardList },
        { href: "/admin/trips", label: "Trips", icon: Navigation },
        { href: "/admin/registrations", label: "Registrations", icon: Users },
    ];
    var isActive = function (href, exact) {
        if (exact)
            return location === href;
        return location.startsWith(href);
    };
    return (<div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="flex h-14 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={function () { return setSidebarOpen(!sidebarOpen); }} data-testid="button-admin-menu">
            <Menu className="h-5 w-5"/>
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary overflow-hidden">
              <img src={flagFish} alt="Flag Fish" className="h-7 w-7 object-contain"/>
            </div>
            <span className="font-semibold">Project Healing Waters - DENVER Admin page</span>
          </div>
          <div className="ml-auto">
            <Button variant="ghost" size="sm" onClick={function () {
            logout();
            navigate("/");
        }} data-testid="button-admin-logout">
              <LogOut className="mr-2 h-4 w-4"/>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className={"\n          fixed inset-y-0 left-0 z-40 w-64 transform bg-background border-r pt-14 transition-transform duration-200\n          lg:relative lg:translate-x-0 lg:pt-0\n          ".concat(sidebarOpen ? "translate-x-0" : "-translate-x-full", "\n        ")}>
          <nav className="flex flex-col gap-1 p-4">
            {navItems.map(function (item) { return (<Link key={item.href} href={item.href}>
                <Button variant={isActive(item.href, item.exact) ? "secondary" : "ghost"} className="w-full justify-start gap-2" onClick={function () { return setSidebarOpen(false); }} data-testid={"link-admin-".concat(item.label.toLowerCase())}>
                  <item.icon className="h-4 w-4"/>
                  {item.label}
                </Button>
              </Link>); })}
          </nav>
        </aside>

        {sidebarOpen && (<div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={function () { return setSidebarOpen(false); }}/>)}

        <main className="flex-1 p-6 lg:p-8">
          <Switch>
            <Route path="/admin" component={AdminDashboard}/>
            <Route path="/admin/events" component={AdminEvents}/>
            <Route path="/admin/programs" component={AdminPrograms}/>
            <Route path="/admin/trips" component={AdminTrips}/>
            <Route path="/admin/registrations" component={AdminRegistrations}/>
          </Switch>
        </main>
      </div>
    </div>);
}
