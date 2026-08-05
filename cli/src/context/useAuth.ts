import { createContext, useContext } from "react";
import type { AuthUser } from "../types/Auth";

export interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (token: string, user: AuthUser) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}
