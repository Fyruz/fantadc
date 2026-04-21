export type PageParam = string | string[] | undefined;

export type PaginationState = {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  skip: number;
  take: number;
  from: number;
  to: number;
};

function normalizePositiveInteger(value: string | undefined): number {
  if (!value) return 1;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

export function resolvePageParam(page: PageParam): number {
  return normalizePositiveInteger(Array.isArray(page) ? page[0] : page);
}

export function getPaginationState(
  page: PageParam,
  totalItems: number,
  pageSize: number
): PaginationState {
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const currentPage = Math.min(resolvePageParam(page), totalPages);
  const skip = (currentPage - 1) * safePageSize;
  const take = safePageSize;
  const from = totalItems === 0 ? 0 : skip + 1;
  const to = totalItems === 0 ? 0 : Math.min(skip + safePageSize, totalItems);

  return {
    currentPage,
    pageSize: safePageSize,
    totalItems,
    totalPages,
    skip,
    take,
    from,
    to,
  };
}

export function buildPageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}
