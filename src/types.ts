export type Item = {
  id: number | string;
  title: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  shippingFees: number;
  sellerId: number;
  shopId: number;
  status: string;
  imageUrl: string;
  watchers: number[];
};

export type CurrentUser = {
  id: string;
  username?: string;
  email?: string;
  roles?: string[];
};

export type Recommendation = {
  id: string | number;
};

export type Shop = {
  id: number | string;
};

export interface FetchItemsOptions {
  scope?: string;
}

export type HealthResponse = {
  status: string;
  service: string;
  version?: string;
  ready?: boolean;
  statusCode?: number;
};
