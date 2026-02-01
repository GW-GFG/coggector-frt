import type { Shop } from "../types";

interface ShopsListProps {
  shops: Shop[];
}

export default function ShopsList({ shops }: ShopsListProps): JSX.Element {
  if (!shops || shops.length === 0) {
    return (
      <div className="card">
        <h2 className="card-title">My Shops</h2>
        <p className="hint">No shops associated with this user.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title">My Shops</h2>
      <ul className="shops-list">
        {shops.map((shop) => (
          <li key={shop.id}>
            <div className="shop-header">
              <span className="shop-name">Shop {shop.id}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
