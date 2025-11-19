import React from "react";

export default function UserSelector({
  selectedUserId,
  onChangeUser,
  onLoadRecommendations,
  loadingRecs,
  currentUser
}) {
  const rolesLabel = currentUser ? currentUser.roles.join(" / ") : "Invité";

  const isBuyer = currentUser && currentUser.roles.includes("buyer");

  return (
    <div className="card">
      <h2 className="card-title">Connexion</h2>
      <div className="field">
        <label>Utilisateur connecté</label>
        <select
          value={selectedUserId}
          onChange={(e) => onChangeUser(Number(e.target.value))}
        >
          <option value={0}>Invité (non identifié)</option>
          <option value={1}>Alex Seller (Buyer & Seller)</option>
          <option value={2}>Mia Seller (Buyer & Seller)</option>
          <option value={3}>Ben Buyer (Buyer only)</option>
        </select>
      </div>

      <p className="hint">
        Rôles : <strong>{rolesLabel}</strong>
      </p>

      {isBuyer && (
        <button
          className="btn-primary"
          onClick={onLoadRecommendations}
          disabled={loadingRecs}
        >
          {loadingRecs ? "Chargement..." : "Charger les recommandations"}
        </button>
      )}

      {!currentUser && (
        <p className="hint">
          En mode invité tu peux voir le catalogue mais pas acheter.
        </p>
      )}
    </div>
  );
}
