import { useState, useMemo, useEffect, useCallback } from "react";

interface UsePaginationOptions {
  initialPage?: number;
  initialEntriesPerPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  entriesPerPage: number;
  totalPages: number;
  paginatedItems: T[];
  setCurrentPage: (page: number) => void;
  setEntriesPerPage: (entries: number) => void;
  resetToFirstPage: () => void;
}

export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { initialPage = 1, initialEntriesPerPage = 8 } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [entriesPerPage, setEntriesPerPage] = useState(initialEntriesPerPage);

  const totalPages = Math.ceil(items.length / entriesPerPage);

  // Reset to page 1 when items change significantly
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return items.slice(startIndex, startIndex + entriesPerPage);
  }, [items, currentPage, entriesPerPage]);

  const resetToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const handleEntriesPerPageChange = useCallback((entries: number) => {
    setEntriesPerPage(entries);
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    entriesPerPage,
    totalPages,
    paginatedItems,
    setCurrentPage,
    setEntriesPerPage: handleEntriesPerPageChange,
    resetToFirstPage,
  };
}
