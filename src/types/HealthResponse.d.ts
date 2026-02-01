type HealthResponse = {
  status: string;
  service: string;
  version?: string;
  ready?: boolean;
  statusCode?: number;
};