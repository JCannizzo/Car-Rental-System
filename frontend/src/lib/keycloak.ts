import Keycloak from "keycloak-js";

const keycloakUrl = (__KEYCLOAK_URL__ || "http://localhost:8080").replace(
  /\/$/,
  "",
);

const keycloak = new Keycloak({
  url: keycloakUrl,
  realm: "car-rental",
  clientId: "carrental-web",
});

let initPromise: Promise<boolean> | null = null;

export interface AuthUser {
  id: string;
  email: string | null;
  fullName: string | null;
  roles: string[];
}

export async function initializeKeycloak(): Promise<boolean> {
  if (!initPromise) {
    initPromise = keycloak.init({
      onLoad: "check-sso",
      pkceMethod: "S256",
      checkLoginIframe: false,
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
    });
  }

  return initPromise;
}

export function getKeycloakUser(): AuthUser | null {
  if (!keycloak.authenticated || !keycloak.tokenParsed?.sub) {
    return null;
  }

  const token = keycloak.tokenParsed as {
    sub: string;
    email?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    realm_access?: { roles?: string[] };
  };

  const fallbackName = [token.given_name, token.family_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  const fullName = (token.name ?? fallbackName) || null;

  return {
    id: token.sub,
    email: token.email ?? null,
    fullName,
    roles: token.realm_access?.roles ?? [],
  };
}

export function isAuthenticated() {
  return Boolean(keycloak.authenticated);
}

export async function getAccessToken(): Promise<string | null> {
  if (!keycloak.authenticated) {
    return null;
  }

  try {
    await keycloak.updateToken(30);
  } catch {
    return null;
  }

  return keycloak.token ?? null;
}

export function login(redirectUri = window.location.href) {
  return keycloak.login({ redirectUri });
}

export async function register(
  redirectUri = window.location.href,
  options: { bookingConfirmationCode?: string; bookingEmail?: string } = {},
) {
  const { bookingConfirmationCode, bookingEmail } = options;
  const params = new URLSearchParams();
  if (bookingConfirmationCode) {
    params.set("bookingConfirmationCode", bookingConfirmationCode);
  }
  if (bookingEmail) {
    params.set("email", bookingEmail);
    params.set("expectedEmail", bookingEmail);
  }

  if ([...params.keys()].length === 0) {
    return keycloak.register({ redirectUri });
  }

  const url = await keycloak.createRegisterUrl({ redirectUri });
  const separator = url.includes("#") ? "&" : "#";
  window.location.assign(`${url}${separator}${params.toString()}`);
}

export function logout(redirectUri = window.location.origin) {
  return keycloak.logout({ redirectUri });
}

export { keycloak };
