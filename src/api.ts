// api.ts (frontend) — TypeScript

const API_BASE: string = (import.meta as any)?.env?.VITE_API_BASE ?? "";

// ---------- Types utilitaires ----------
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

type RequestOptions = Omit<RequestInit, "headers" | "method" | "body"> & {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown; // on sérialise nous-mêmes en JSON si présent
};

function withAuth(options: RequestOptions = {}, accessToken?: string | null): RequestInit {
  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const init: RequestInit = {
    ...options,
    headers,
    body: options.body as BodyInit | null | undefined,
  };

  return init;
}

async function requestJson<T>(
  path: string,
  options: RequestOptions = {},
  accessToken?: string | null
): Promise<T> {
  const url = `${API_BASE}${path}`;

  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
  };

  // Si on envoie un body, on force JSON
  const hasBody = options.body !== undefined && options.body !== null;
  const init: RequestInit = withAuth(
    {
      method: options.method ?? "GET",
      ...options,
      headers: hasBody ? { "Content-Type": "application/json", ...headers } : headers,
      body: hasBody ? JSON.stringify(options.body) : undefined,
    },
    accessToken
  );

  const res = await fetch(url, init);

  // Erreurs: on renvoie un message utile
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} on ${path}${text ? `: ${text}` : ""}`);
  }

  // 204 = No Content
  if (res.status === 204) return undefined as T;

  // JSON attendu
  return (await res.json()) as T;
}

// ---------- Endpoints ----------

export type HealthResponse = {
  status: string;
  service: string;
  // optionnel selon ta gateway:
  version?: string;
  ready?: boolean;
  statusCode?: number;
};

export async function fetchHealth(): Promise<HealthResponse> {
  return requestJson<HealthResponse>("/healthz");
}

// Items (public)
export type Item = {
  id: number | string;
  name?: string;
  price?: number;
};

export async function fetchItems(params?: { scope?: string }): Promise<Item[]> {
  const qs = new URLSearchParams();
  if (params?.scope) qs.set("scope", params.scope);

  const path = `/items${qs.toString() ? `?${qs.toString()}` : ""}`;
  return requestJson<Item[]>(path);
}

// Current user (protected)
export type CurrentUser = {
  id: string;
  username?: string;
  email?: string;
  roles?: string[];
  // adapte à ta réponse réelle
};

export async function fetchCurrentUser(accessToken: string | null): Promise<CurrentUser | null> {
  if (!accessToken) return null;
  return requestJson<CurrentUser>("/users/me", {}, accessToken);
}

// Recommendations (protected)
export type Recommendation = {
  id: string | number;
  // adapte
};

export async function fetchRecommendations(
  userId: number,
  accessToken: string | null
): Promise<Recommendation[]> {
  return requestJson<Recommendation[]>(`/users/${userId}/recommendations`, {}, accessToken);
}

// Change item price (protected)
export async function changeItemPrice(
  id: number | string,
  newPrice: number,
  accessToken: string | null
): Promise<unknown> {
  return requestJson(
    `/items/${id}/price-change`,
    { method: "POST", body: { newPrice: Number(newPrice) } },
    accessToken
  );
}

// Purchase item (protected)
export async function purchaseItem(
  id: number | string,
  accessToken: string | null
): Promise<unknown> {
  return requestJson(`/items/${id}/purchase`, { method: "POST" }, accessToken);
}

// Shops (protected)
export type Shop = {
  id: number | string;
  // adapte
};

export async function fetchShops(accessToken: string | null): Promise<Shop[]> {
  return requestJson<Shop[]>("/shops", {}, accessToken);
}
