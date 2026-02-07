type UserBasic = {
  id: string;
  username?: string;
};

type Item = {
  id: number;
  title: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  shippingFees: number;
  sellerId: string;
  seller?: UserBasic;
  shopId: number;
  status: string;
  imageUrl: string;
  watchers: UserBasic[];
};
