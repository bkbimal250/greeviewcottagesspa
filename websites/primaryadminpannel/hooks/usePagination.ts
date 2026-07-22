"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";
import { PAGINATION } from "@/lib/constants";

export interface PaginationState {
  page: number;
  pageSize: number;
}

export interface PaginationMetadata {
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
}

interface UsePaginationReturn
  extends PaginationState,
    PaginationMetadata {
  offset: number;
  startItem: number;
  endItem: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setTotalItems: (totalItems: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  resetPagination: () => void;
}

export function usePagination(
  options: UsePaginationOptions = {},
): UsePaginationReturn {
  const initialPage = Math.max(
    1,
    options.initialPage ||
      PAGINATION.defaultPage,
  );

  const initialPageSize = Math.max(
    1,
    options.initialPageSize ||
      PAGINATION.defaultPageSize,
  );

  const [page, setCurrentPage] =
    useState(initialPage);

  const [pageSize, setCurrentPageSize] =
    useState(initialPageSize);

  const [totalItems, setTotal] = useState(
    Math.max(0, options.totalItems || 0),
  );

  const totalPages = useMemo(() => {
    if (totalItems === 0) {
      return 1;
    }

    return Math.max(
      1,
      Math.ceil(totalItems / pageSize),
    );
  }, [totalItems, pageSize]);

  const setPage = useCallback(
    (nextPage: number) => {
      setCurrentPage(
        Math.min(
          Math.max(1, nextPage),
          totalPages,
        ),
      );
    },
    [totalPages],
  );

  const setPageSize = useCallback(
    (nextPageSize: number) => {
      const normalizedPageSize = Math.min(
        Math.max(1, nextPageSize),
        PAGINATION.maxPageSize,
      );

      setCurrentPageSize(normalizedPageSize);
      setCurrentPage(1);
    },
    [],
  );

  const setTotalItems = useCallback(
    (nextTotalItems: number) => {
      const normalizedTotal = Math.max(
        0,
        nextTotalItems,
      );

      setTotal(normalizedTotal);

      setCurrentPage((currentPage) => {
        const nextTotalPages =
          normalizedTotal === 0
            ? 1
            : Math.ceil(
                normalizedTotal / pageSize,
              );

        return Math.min(
          currentPage,
          Math.max(1, nextTotalPages),
        );
      });
    },
    [pageSize],
  );

  const nextPage = useCallback(() => {
    setCurrentPage((currentPage) =>
      Math.min(currentPage + 1, totalPages),
    );
  }, [totalPages]);

  const previousPage = useCallback(() => {
    setCurrentPage((currentPage) =>
      Math.max(currentPage - 1, 1),
    );
  }, []);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const resetPagination = useCallback(() => {
    setCurrentPage(initialPage);
    setCurrentPageSize(initialPageSize);
    setTotal(
      Math.max(0, options.totalItems || 0),
    );
  }, [
    initialPage,
    initialPageSize,
    options.totalItems,
  ]);

  const offset = (page - 1) * pageSize;

  const startItem =
    totalItems === 0 ? 0 : offset + 1;

  const endItem = Math.min(
    offset + pageSize,
    totalItems,
  );

  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    offset,
    startItem,
    endItem,
    hasNextPage,
    hasPreviousPage,
    setPage,
    setPageSize,
    setTotalItems,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    resetPagination,
  };
}

export default usePagination;