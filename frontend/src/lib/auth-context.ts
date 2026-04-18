import { createContext } from "react";
import type { AuthUser } from "@/lib/keycloak";

export interface AuthContextValue {
  error: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (redirectUri?: string) => Promise<void>;
  logout: (redirectUri?: string) => Promise<void>;
  register: (
    redirectUri?: string,
    options?: { bookingConfirmationCode?: string; bookingEmail?: string },
  ) => Promise<void>;
  user: AuthUser | null;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
