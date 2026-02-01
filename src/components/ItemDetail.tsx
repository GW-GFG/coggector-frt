import React, { useState, useEffect } from "react";
import type { Item, CurrentUser } from "../types";

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
      <h3 className="item-title">{item.name}</h3>

      <div className="detail-row">
        <div>
          <div className="label">Price</div>
          <div>{item.price}</div>
        </div>
      </div>

      {/* Purchase section */}
      <div className="detail-form" style={{ marginTop: 10 }}>
        {isGuest ? (
          <p className="hint">
            You are not logged in. Log in to purchase items.
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
      {currentUser?.roles?.includes("seller") && (
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
