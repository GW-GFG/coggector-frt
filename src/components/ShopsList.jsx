// src/components/ShopsList.jsx
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
        {shops.map((shop) => {
          // ⚠️ Microservices : le backend ne renvoie pas encore shop.items
          // donc on évite de planter si items est undefined
          const itemsCount = Array.isArray(shop.items)
            ? shop.items.length
            : shop.itemsCount ?? 0; // fallback: 0 si rien

          return (
            <li key={shop.id}>
              <div className="shop-header">
                <span className="shop-name">{shop.name}</span>
                <span className="shop-theme">{shop.theme}</span>
              </div>
              <p className="hint">
                {itemsCount} article(s) dans cette boutique (info factice si 0).
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
