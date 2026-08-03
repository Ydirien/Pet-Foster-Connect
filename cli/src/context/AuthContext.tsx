import { createContext, useContext, useState, type ReactNode } from "react";
import type { AuthUser } from "../types/Auth";

interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (token: string, user: AuthUser) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredUser(): AuthUser | null {
    const raw = localStorage.getItem("authUser");
    if (!raw) return null;
    try {
        return JSON.parse(raw) as AuthUser;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

    function login(token: string, nextUser: AuthUser) {
        localStorage.setItem("accessToken", token);
        localStorage.setItem("authUser", JSON.stringify(nextUser));
        setUser(nextUser);
    }

    function logout() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("authUser");
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: user !== null, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}