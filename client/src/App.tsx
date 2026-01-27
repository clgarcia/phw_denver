import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { AuthProvider } from "@/lib/auth-context";
import { ProtectedAdminRoute } from "@/pages/admin/protected-route";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Events from "@/pages/events";
import EventDetail from "@/pages/event-detail";
import Programs from "@/pages/programs";
import ProgramDetail from "@/pages/program-detail";
import Trips from "@/pages/trips";
import TripDetail from "@/pages/trip-detail";
import Register from "@/pages/register";
import AdminLayout from "@/pages/admin/index";

function Router() {
  useScrollToTop();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/events" component={Events} />
      <Route path="/events/:id" component={EventDetail} />
      <Route path="/programs" component={Programs} />
      <Route path="/programs/:id" component={ProgramDetail} />
      <Route path="/trips" component={Trips} />
      <Route path="/trips/:id" component={TripDetail} />
      <Route path="/register" component={Register} />
      <Route path="/admin" component={() => <ProtectedAdminRoute component={AdminLayout} />} />
      <Route path="/admin/:rest*" component={() => <ProtectedAdminRoute component={AdminLayout} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
