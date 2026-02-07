interface UserSelectorProps {
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;

  onLoadRecommendations: () => Promise<void>;
  loadingRecs: boolean;

  currentUser: CurrentUser | null;
}

const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default function UserSelector({
  isAuthenticated,
  onLogin,
  onLogout,
  onLoadRecommendations,
  loadingRecs,
  currentUser,
}: UserSelectorProps): JSX.Element {
  const rolesLabel = currentUser?.roles?.length
    ? currentUser.roles.join(" / ")
    : isAuthenticated
      ? "Authentifié(e)"
      : "Invité(e)";

  const isBuyer = currentUser?.roles?.includes("buyer") ?? false;
  
  const rawDisplayName = currentUser?.username || currentUser?.email || currentUser?.id;
  const displayName = rawDisplayName ? capitalize(rawDisplayName) : rawDisplayName;

  return (
    <div className="card">
      <h2 className="card-title">Espace utilisateur</h2>

      {isAuthenticated && currentUser && (
        <p className="hint" style={{ marginBottom: 8 }}>
          Connecté en tant que: <strong>{displayName}</strong>
        </p>
      )}

      <div className="field" style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {!isAuthenticated ? (
          <button className="btn-primary" onClick={onLogin}>
            Connexion
          </button>
        ) : (
          <button className="btn-secondary" onClick={onLogout}>
            Déconnexion
          </button>
        )}

        <span className="hint">
          Statut: <strong>{isAuthenticated ? "Connecté(e)" : "Invité(e)"}</strong>
        </span>
      </div>

      <p className="hint">
        Rôles: <strong>{rolesLabel}</strong>
      </p>

      {isBuyer && (
        <button
          className="btn-primary"
          onClick={onLoadRecommendations}
          disabled
        >
          {loadingRecs ? "Chargement..." : "Charger les recommandations"}
        </button>
      )}

      {isAuthenticated && !currentUser && (
        <p className="hint">
          Profil inaccessible.
        </p>
      )}
    </div>
  );
}
