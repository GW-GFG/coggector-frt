import React from "react";

export default function ShopsList({ shops }) {
  if (!shops || shops.length === 0) {
    return (
      <div className="card">
        <h2 className="card-title">Mes boutiques</h2>
        <p className="hint">Aucune boutique associée à cet utilisateur.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title">Mes boutiques</h2>
      <ul className="shops-list">
        {shops.map((shop) => (
          <li key={shop.id}>
            <div className="shop-header">
              <span className="shop-name">{shop.name}</span>
              <span className="shop-theme">{shop.theme}</span>
            </div>
            <p className="hint">
              {shop.items.length} article(s) dans cette boutique.
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
