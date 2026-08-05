import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../../context/useAuth";
import type { UserRole } from "../../types/Auth";

interface ProtectedRouteProps {
    children: ReactNode;
    role?: UserRole;
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/connexion" replace />;
    }

    if (role && user?.role !== role) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}