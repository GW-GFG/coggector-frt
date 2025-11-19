import React, { useState, useEffect } from "react";

export default function ItemDetail({
  item,
  onChangePrice,
  onPurchase,
  currentUser
}) {
  const [priceInput, setPriceInput] = useState(item ? item.price : "");

  useEffect(() => {
    if (item) setPriceInput(item.price);
  }, [item]);

  if (!item) {
    return (
      <div className="card">
        <h2 className="card-title">Détail article</h2>
        <p>Sélectionne un article dans la liste.</p>
      </div>
    );
  }

  const isSeller = currentUser && currentUser.roles.includes("seller");
  const isBuyer = currentUser && currentUser.roles.includes("buyer");
  const isOwner = currentUser && item.sellerId === currentUser.id;
  const isGuest = !currentUser;

  const handleSubmitPrice = (e) => {
    e.preventDefault();
    if (!priceInput || isNaN(priceInput)) return;
    onChangePrice(item.id, Number(priceInput));
  };

  const handlePurchase = () => {
    onPurchase(item.id);
  };

  return (
    <div className="card">
      <h2 className="card-title">Détail article</h2>
      {item.imageUrl && (
        <div className="detail-image-wrapper">
          <img src={item.imageUrl} alt={item.title} className="detail-image" />
        </div>
      )}
      <h3 className="item-title">{item.title}</h3>
      <p className="item-desc">{item.description}</p>

      <div className="detail-row">
        <div>
          <div className="label">Catégorie</div>
          <div>{item.category}</div>
        </div>
        <div>
          <div className="label">Prix</div>
          <div>
            {item.price} {item.currency}
          </div>
        </div>
        <div>
          <div className="label">Frais de port</div>
          <div>{item.shippingFees} €</div>
        </div>
      </div>

      {/* Zone achat */}
            <div className="detail-form" style={{ marginTop: 10 }}>
        <label>Action d'achat</label>
        {isGuest ? (
          <p className="hint">
            Tu es en mode invité : tu peux voir le catalogue mais pas acheter.
          </p>
        ) : isOwner ? (
          <p className="hint">
            Cet article t'appartient (seller) : tu ne peux pas l'acheter.
          </p>
        ) : isBuyer ? (
          <button className="btn-primary" onClick={handlePurchase}>
            Acheter cet article
          </button>
        ) : (
          <p className="hint">
            Tu n'as pas le rôle buyer, l'achat n'est pas possible.
          </p>
        )}
      </div>


      {/* Zone changement de prix (seller propriétaire uniquement) */}
      {isSeller && isOwner && (
        <form onSubmit={handleSubmitPrice} className="detail-form">
          <label>Modifier le prix (seller propriétaire)</label>
          <div className="detail-form-row">
            <input
              type="number"
              step="0.01"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
            />
            <button type="submit" className="btn-secondary">
              Changer le prix
            </button>
          </div>
          <p className="hint">
            Appel à <code>/api/items/{item.id}/price-change</code>.
          </p>
        </form>
      )}

      {isSeller && !isOwner && (
        <p className="hint">
          Tu es seller, mais cet article n'est pas dans ta boutique (pas de
          modification de prix possible).
        </p>
      )}
    </div>
  );
}
