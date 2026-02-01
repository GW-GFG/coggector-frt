export type Item = {
  id: number | string;
  name?: string;
  price?: number;
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
