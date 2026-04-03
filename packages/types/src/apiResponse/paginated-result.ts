export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

export interface PaginatedResult<T> {
  data: T[] | T;
  total: number;
  page: number;
  pageSize: number;
}

export interface SingleResult<T> {
  data: T;
}
