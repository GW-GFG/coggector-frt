interface UserSelectorProps {
  accessToken: string | null;
  onChangeAccessToken: (token: string | null) => void;
  onLoadRecommendations: () => Promise<void>;
  loadingRecs: boolean;
  currentUser: CurrentUser | null;
}

export default function UserSelector({
  accessToken,
  onChangeAccessToken,
  onLoadRecommendations,
  loadingRecs,
  currentUser,
}: UserSelectorProps): JSX.Element {
  const rolesLabel = currentUser ? currentUser.roles?.join(" / ") ?? "User" : "Guest";

  const isBuyer = currentUser?.roles?.includes("buyer");

  return (
    <div className="card">
      <h2 className="card-title">Connexion</h2>
      <div className="field">
        <label>Jeton d'accès</label>
        <input
          type="password"
          value={accessToken ?? ""}
          onChange={(e) => onChangeAccessToken(e.target.value || null)}
          placeholder="Entrez votre jeton d'accès"
        />
      </div>

      <p className="hint">
        Roles: <strong>{rolesLabel}</strong>
      </p>

      {isBuyer && (
        <button
          className="btn-primary"
          onClick={onLoadRecommendations}
          disabled={loadingRecs}
        >
          {loadingRecs ? "Loading..." : "Load Recommendations"}
        </button>
      )}

      {!currentUser && (
        <p className="hint">
          Vous n'êtes pas connecté. Entrez un jeton pour accéder aux fonctionnalités.
        </p>
      )}
    </div>
  );
}
