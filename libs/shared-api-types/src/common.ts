export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

declare const isoDateBrand: unique symbol;
export type IsoDateString = string & { readonly [isoDateBrand]: true };
