import React from "react";
import ItemCard from "./ItemCard.jsx";

export default function ItemList({ items, onSelect, currentUser }) {
  const isSellerOnly =
    currentUser &&
    currentUser.roles.includes("seller") &&
    !currentUser.roles.includes("buyer"); // ici ça n'arrivera pas mais on garde la logique

  const isGuest = !currentUser;

  const title = isGuest
    ? "Catalogue (invité)"
    : isSellerOnly
    ? "Mes annonces (seller)"
    : "Catalogue";

  return (
    <div className="card">
      <div className="card-title-row">
        <h2 className="card-title">{title}</h2>
        <span className="pill">{items.length} article(s)</span>
      </div>
      <div className="item-grid">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onSelect={onSelect}
            currentUser={currentUser}
          />
        ))}
      </div>
    </div>
  );
}
