import React from "react";

export default function Recommendations({ data }) {
  if (!data) return null;

  const { recommendations } = data;

  return (
    <div className="card">
      <h2 className="card-title">Recommandations</h2>
      {recommendations.length === 0 ? (
        <p>Aucune recommandation pour cet utilisateur.</p>
      ) : (
        <ul className="reco-list">
          {recommendations.map((item) => (
            <li key={item.id}>
              <span className="reco-title">{item.title}</span>
              <span className="reco-price">
                {item.price} {item.currency}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
