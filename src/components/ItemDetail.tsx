import React, { useState, useEffect } from "react";

interface ItemDetailProps {
  item: Item | null;
  onChangePrice: (itemId: number | string, newPrice: number) => Promise<void>;
  onPurchase: (itemId: number | string) => Promise<void>;
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
        <h2 className="card-title">Item Detail</h2>
        <p>Select an item from the list.</p>
      </div>
    );
  }

  const isBuyer = currentUser?.roles?.includes("buyer");
  const isSeller = currentUser?.roles?.includes("seller");
  const isOwner = currentUser && item.sellerId === Number(currentUser.id);
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
      <h2 className="card-title">Item Detail</h2>
      {item.imageUrl && (
        <div className="detail-image-wrapper">
          <img src={item.imageUrl} alt={item.title} className="detail-image" />
        </div>
      )}
      <h3 className="item-title">{item.title}</h3>
      <p className="item-desc">{item.description}</p>

      <div className="detail-row">
        <div>
          <div className="label">Category</div>
          <div>{item.category}</div>
        </div>
        <div>
          <div className="label">Price</div>
          <div>
            {item.price} {item.currency}
          </div>
        </div>
        <div>
          <div className="label">Shipping</div>
          <div>{item.shippingFees} €</div>
        </div>
      </div>

      {/* Purchase section */}
      <div className="detail-form" style={{ marginTop: 10 }}>
        {isGuest ? (
          <p className="hint">
            You are not logged in. Log in to purchase items.
          </p>
        ) : isOwner ? (
          <p className="hint">
            You own this item: you cannot purchase it.
          </p>
        ) : isBuyer ? (
          <button className="btn-primary" onClick={handlePurchase}>
            Purchase this item
          </button>
        ) : (
          <p className="hint">
            You don't have the buyer role.
          </p>
        )}
      </div>

      {/* Price change form (seller only) */}
      {isSeller && isOwner && (
        <form onSubmit={handleSubmitPrice} className="detail-form">
          <label>Change Price</label>
          <div className="detail-form-row">
            <input
              type="number"
              step="0.01"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
            />
            <button type="submit" className="btn-secondary">
              Update Price
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
