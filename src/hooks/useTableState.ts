import { useState, useCallback } from 'react';

export interface TableStateOptions {
  initialPage?: number;
  initialSize?: number;
  initialSort?: { field: string; dir: 'asc' | 'desc' };
  initialFilters?: Record<string,string>;
}

export interface TableState {
  page: number;
  size: number;
  sort: { field: string; dir: 'asc' | 'desc' };
  filters: Record<string,string>;
  setPage: (p: number) => void;
  setSize: (s: number) => void;
  setSort: (s: { field: string; dir: 'asc' | 'desc' }) => void;
  setFilters: (f: Record<string,string>) => void;
  reset: () => void;
}

export function useTableState({ initialPage = 0, initialSize = 25, initialSort = { field: 'createdAt', dir: 'desc'}, initialFilters = {} }: TableStateOptions = {}): TableState {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [sort, setSort] = useState(initialSort);
  const [filters, setFilters] = useState<Record<string,string>>(initialFilters);
  const reset = useCallback(() => { setPage(initialPage); setSize(initialSize); setSort(initialSort); setFilters(initialFilters); }, [initialPage, initialSize, initialSort, initialFilters]);
  return { page, size, sort, filters, setPage, setSize, setSort, setFilters, reset };
}

