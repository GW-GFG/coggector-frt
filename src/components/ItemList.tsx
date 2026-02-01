import ItemCard from "./ItemCard";
import type { Item, CurrentUser } from "../types";

interface ItemListProps {
  items: Item[];
  onSelect: (item: Item) => void;
  currentUser: CurrentUser | null;
}

export default function ItemList({
  items,
  onSelect,
  currentUser,
}: ItemListProps): JSX.Element {
  const isSellerOnly =
    currentUser &&
    currentUser.roles?.includes("seller") &&
    !currentUser.roles?.includes("buyer");

  const isGuest = !currentUser;

  const title = isGuest
    ? "Catalog (Guest)"
    : isSellerOnly
      ? "My Listings (Seller)"
      : "Catalog";

  return (
    <div className="card">
      <div className="card-title-row">
        <h2 className="card-title">{title}</h2>
        <span className="pill">{items.length} item(s)</span>
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
