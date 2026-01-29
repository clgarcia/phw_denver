import { useAuth } from "@/lib/auth-context";
import AdminLogin from "./login";
export function ProtectedAdminRoute(_a) {
    var Component = _a.component;
    var isAuthenticated = useAuth().isAuthenticated;
    if (!isAuthenticated) {
        return <AdminLogin />;
    }
    return <Component />;
}
