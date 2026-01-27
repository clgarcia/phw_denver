import { useAuth } from "@/lib/auth-context";
import AdminLogin from "./login";

interface ProtectedAdminRouteProps {
  component: React.ComponentType<any>;
}

export function ProtectedAdminRoute({ component: Component }: ProtectedAdminRouteProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <Component />;
}
