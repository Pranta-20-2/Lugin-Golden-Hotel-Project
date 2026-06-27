export type PaginationParams = {
  page: number;
  pageSize: number;
  search?: string;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  search?: string;
};

export function normalizePaginationParams(
  page?: string | number | null,
  pageSize?: string | number | null,
  search?: string | null
): PaginationParams {
  const parsedPage = Number(page ?? 1);
  const parsedPageSize = Number(pageSize ?? 10);

  return {
    page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    pageSize:
      Number.isInteger(parsedPageSize) && parsedPageSize > 0
        ? Math.min(parsedPageSize, 100)
        : 10,
    search: search?.trim() || undefined,
  };
}

export function getPaginationRange({ page, pageSize }: PaginationParams) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return { from, to };
}

export function toPaginatedResult<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResult<T> {
  return {
    data,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.max(1, Math.ceil(total / params.pageSize)),
    search: params.search,
  };
}
