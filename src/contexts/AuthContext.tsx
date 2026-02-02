import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/types";
import { authService } from "@/services/auth";
import { getUserFromToken, isTokenExpired } from "@/lib/jwt";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  logout: () => void;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserFromToken = () => {
    const token = authService.getToken();

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (isTokenExpired(token)) {
      authService.logout();
      setUser(null);
      setIsLoading(false);
      return;
    }

    const userData = getUserFromToken(token);
    setUser(userData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadUserFromToken();
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
        refetchUser: loadUserFromToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
