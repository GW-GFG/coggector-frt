type RequestOptions = Omit<RequestInit, "headers" | "method" | "body"> & {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
};
