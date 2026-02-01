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
      <div className="item-card-header">
        <div className="item-card-header-left">
          <span className="item-category">{item.name}</span>
        </div>
      </div>
      <h3 className="item-title">{item.name}</h3>
      <div className="item-footer">
        <span className="item-price">{item.price}</span>
      </div>
    </div>
  );
}
