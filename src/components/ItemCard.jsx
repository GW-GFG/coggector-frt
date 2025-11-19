import React from "react";

export default function ItemCard({ item, onSelect, currentUser }) {
  const isOwner = currentUser && item.sellerId === currentUser.id;

  return (
    <div className="item-card" onClick={() => onSelect(item)}>
      {item.imageUrl && (
        <div className="item-image-wrapper">
          <img src={item.imageUrl} alt={item.title} className="item-image" />
        </div>
      )}
      <div className="item-card-header">
        <div className="item-card-header-left">
          <span className="item-category">{item.category}</span>
          {isOwner && <span className="owner-pill">Mes articles</span>}
        </div>
        <span className={`item-status badge-${item.status || "default"}`}>
          {item.status || "unknown"}
        </span>
      </div>
      <h3 className="item-title">{item.title}</h3>
      <p className="item-desc">
        {item.description?.length > 80
          ? item.description.slice(0, 80) + "..."
          : item.description}
      </p>
      <div className="item-footer">
        <span className="item-price">
          {item.price} {item.currency}
        </span>
        <span className="item-shipping">+ {item.shippingFees}€ livraison</span>
      </div>
    </div>
  );
}
