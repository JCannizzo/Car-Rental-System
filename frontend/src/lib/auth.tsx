import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AuthContext, type AuthContextValue } from "@/lib/auth-context";
import {
  getKeycloakUser,
  initializeKeycloak,
  isAuthenticated,
  keycloak,
  login,
  logout,
  register,
} from "@/lib/keycloak";

function createSnapshot(error: string | null = null): AuthContextValue {
  return {
    error,
    isAuthenticated: isAuthenticated(),
    isReady: true,
    login,
    logout,
    register,
    user: getKeycloakUser(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<AuthContextValue>({
    error: null,
    isAuthenticated: false,
    isReady: false,
    login,
    logout,
    register,
    user: null,
  });

  useEffect(() => {
    let isMounted = true;

    const sync = (error: string | null = null) => {
      if (!isMounted) {
        return;
      }

      setValue(createSnapshot(error));
    };

    keycloak.onAuthSuccess = () => sync();
    keycloak.onAuthLogout = () => sync();
    keycloak.onAuthRefreshSuccess = () => sync();
    keycloak.onTokenExpired = () => {
      void keycloak.updateToken(30).then(() => sync()).catch(() => sync());
    };

    void initializeKeycloak()
      .then(() => sync())
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        setValue({
          error:
            error instanceof Error
              ? error.message
              : "Failed to initialize authentication.",
          isAuthenticated: false,
          isReady: true,
          login,
          logout,
          register,
          user: null,
        });
      });

    return () => {
      isMounted = false;
      keycloak.onAuthSuccess = undefined;
      keycloak.onAuthLogout = undefined;
      keycloak.onAuthRefreshSuccess = undefined;
      keycloak.onTokenExpired = undefined;
    };
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
