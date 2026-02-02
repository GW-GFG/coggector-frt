import Keycloak from "keycloak-js";

export const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
});

let initPromise: Promise<boolean> | null = null;

export function initKeycloakOnce(options: Parameters<typeof keycloak.init>[0]): Promise<boolean> {
  if (!initPromise) {
    initPromise = keycloak.init(options);
  }
  return initPromise;
}