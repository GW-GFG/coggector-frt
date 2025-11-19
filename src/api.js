const API_BASE = "/api";

// Ajoute le header x-user-id si userId > 0
function withUserId(options = {}, userId) {
  const headers = {
    ...(options.headers || {})
  };
  if (userId && userId > 0) {
    headers["x-user-id"] = String(userId);
  }
  return { ...options, headers };
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Erreur health");
  return res.json();
}

export async function fetchItems(userId, { scope } = {}) {
  const params = new URLSearchParams();
  if (scope) params.set("scope", scope);

  const res = await fetch(
    `${API_BASE}/items${params.toString() ? "?" + params.toString() : ""}`,
    withUserId({}, userId)
  );
  if (!res.ok) throw new Error("Erreur items");
  return res.json();
}

export async function fetchCurrentUser(userId) {
  if (!userId || userId === 0) {
    // invité : pas d'appel /users/me
    return null;
  }
  const res = await fetch(`${API_BASE}/users/me`, withUserId({}, userId));
  if (!res.ok) throw new Error("Erreur utilisateur courant");
  return res.json();
}

export async function fetchRecommendations(userId) {
  const res = await fetch(
    `${API_BASE}/users/${userId}/recommendations`,
    withUserId({}, userId)
  );
  if (!res.ok) throw new Error("Erreur recommandations");
  return res.json();
}

export async function changeItemPrice(userId, id, newPrice) {
  const res = await fetch(
    `${API_BASE}/items/${id}/price-change`,
    withUserId(
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPrice: Number(newPrice) })
      },
      userId
    )
  );
  if (!res.ok) throw new Error("Erreur changement de prix");
  return res.json();
}

// Simuler un achat
export async function purchaseItem(userId, id) {
  const res = await fetch(
    `${API_BASE}/items/${id}/purchase`,
    withUserId(
      {
        method: "POST"
      },
      userId
    )
  );
  if (!res.ok) throw new Error("Erreur achat");
  return res.json();
}

// Récupération des shops du seller
export async function fetchShops(userId) {
  const res = await fetch(`${API_BASE}/shops`, withUserId({}, userId));
  if (!res.ok) throw new Error("Erreur shops");
  return res.json();
}
