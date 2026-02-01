import type { Item, CurrentUser } from "../types";

interface ItemCardProps {
  item: Item;
  onSelect: (item: Item) => void;
  currentUser: CurrentUser | null;
}

export default function ItemCard({
  item,
  onSelect,
}: ItemCardProps): JSX.Element {
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
        <span className="item-shipping">+ {item.shippingFees}€ shipping</span>
      </div>
    </div>
  );
}
