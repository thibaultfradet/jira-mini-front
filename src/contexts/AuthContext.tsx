import { useCallback, useState, type ReactNode } from "react";
import type { User } from "@/types";
import { authService } from "@/services/auth";
import { getUserFromToken, isTokenExpired } from "@/lib/jwt";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const token = authService.getToken();
    if (!token) return null;
    if (isTokenExpired(token)) {
      authService.logout();
      return null;
    }
    return getUserFromToken(token);
  });
  const [isLoading] = useState(false);

  const refetchUser = useCallback(() => {
    const token = authService.getToken();
    if (!token) {
      setUser(null);
      return;
    }
    if (isTokenExpired(token)) {
      authService.logout();
      setUser(null);
      return;
    }
    setUser(getUserFromToken(token));
  }, []);

  const logout = () => {
    authService.logout();
    setUser(null);
    window.location.href = "/login";
  };

  const isAdmin = user?.roles.includes("ROLE_ADMIN") ?? false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
