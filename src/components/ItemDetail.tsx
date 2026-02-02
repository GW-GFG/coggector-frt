import { useState, useEffect } from "react";

interface ItemDetailProps {
  item: Item | null;
  onChangePrice: (itemId: number, newPrice: number) => Promise<void>;
  onPurchase: (itemId: number) => Promise<void>;
  currentUser: CurrentUser | null;
}

export default function ItemDetail({
  item,
  onChangePrice,
  onPurchase,
  currentUser,
}: ItemDetailProps): JSX.Element {
  const [priceInput, setPriceInput] = useState<string | number>(
    item?.price ?? ""
  );

  useEffect(() => {
    if (item?.price) setPriceInput(item.price);
  }, [item]);

  if (!item) {
    return (
      <div className="card">
        <h2 className="card-title">Fiche article</h2>
        <p>Sélectionnez un article dans la liste.</p>
      </div>
    );
  }

  const isBuyer = currentUser?.roles?.includes("buyer");
  const isSeller = currentUser?.roles?.includes("seller");
  const isOwner = currentUser && item.sellerId === currentUser.id;
  const isGuest = !currentUser;

  const handleSubmitPrice = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!priceInput || isNaN(Number(priceInput))) return;
    onChangePrice(item.id, Number(priceInput));
  };

  const handlePurchase = (): void => {
    onPurchase(item.id);
  };

  return (
    <div className="card">
      <h2 className="card-title">Fiche article</h2>
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
          <div className="label">Frais de livraison</div>
          <div>{item.shippingFees} €</div>
        </div>
      </div>

      {/* Purchase section */}
      <div className="detail-form" style={{ marginTop: 10 }}>
        {isGuest ? (
          <p className="hint">
            Vous devez être connecté pour acheter cet article.
          </p>
        ) : isOwner ? (
          <p className="hint">
            Vous possédez cet article : vous ne pouvez pas l'acheter.
          </p>
        ) : isBuyer ? (
          <button className="btn-primary" onClick={handlePurchase}>
            Acheter cet article
          </button>
        ) : (
          <p className="hint">
            Veuillez vous connecter pour acheter cet article.
          </p>
        )}
      </div>

      {/* Price change form (seller only) */}
      {isSeller && isOwner && (
        <form onSubmit={handleSubmitPrice} className="detail-form">
          <label>Changer le prix</label>
          <div className="detail-form-row">
            <input
              type="number"
              step="0.01"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
            />
            <button type="submit" className="btn-secondary">
              Mettre à jour le prix
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
