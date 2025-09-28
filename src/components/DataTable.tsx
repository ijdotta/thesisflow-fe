import * as React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // added
import { ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export type SortDir = "asc" | "desc";
export type Sort = { field: string; dir: SortDir };

export type Column<T> = {
  id: string;
  header: React.ReactNode;
  accessor: (row: T) => React.ReactNode;
  sortField?: string;         // enables clickable header & filtering
  className?: string;
  width?: string;
  filter?: {                  // NEW: filter configuration (requires sortField)
    type?: 'text' | 'select'; // default 'text'
    options?: { value: string; label: string }[]; // for select
    placeholder?: string;
  }
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  total: number;
  loading?: boolean;
  error?: string | null;

  // controlled state
  page: number;
  size: number;
  sort: Sort;
  filters?: Record<string, string>; // key = sortField / backend field
  // handlers
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  onSortChange: (sort: Sort) => void;
  onFiltersChange?: (filters: Record<string, string>) => void;
  filterDebounceMs?: number; // NEW: debounce for text filters
  showFilterChips?: boolean; // NEW: show chips summarizing active filters

  empty?: React.ReactNode;
};

export function DataTable<T>({
  columns, rows, total, loading, error,
  page, size, sort, filters = {},
  onPageChange, onSizeChange, onSortChange, onFiltersChange,
  filterDebounceMs = 400,
  showFilterChips = true,
  empty = <div className="text-sm text-muted-foreground p-4">No data</div>,
}: Props<T>) {
  const totalPages = Math.max(1, Math.ceil((total ?? 0) / (size || 1)));

  function toggleSort(nextField: string) {
    onSortChange(
      sort.field === nextField
        ? { field: nextField, dir: sort.dir === "asc" ? "desc" : "asc" }
        : { field: nextField, dir: "asc" }
    );
    onPageChange(0);
  }

  const [inputFilters, setInputFilters] = React.useState<Record<string, string>>(filters);
  // Refs to inputs for keyboard focusing
  const textFilterRefs = React.useRef<HTMLInputElement[]>([]);
  textFilterRefs.current = [];
  const assignTextRef = (el: HTMLInputElement | null) => { if (el) textFilterRefs.current.push(el); };

  React.useEffect(() => { setInputFilters(filters); }, [filters]);

  function updateSelectFilter(field: string, value: string) {
    if (!onFiltersChange) return;
    const next = { ...(filters || {}) };
    if (!value) delete next[field]; else next[field] = value;
    onFiltersChange(next);
    onPageChange(0);
  }

  function normalize(obj: Record<string,string>): Record<string,string> {
    const out: Record<string,string> = {};
    Object.entries(obj).forEach(([k,v]) => { const val = v.trim(); if (val) out[k]=val; });
    return out;
  }

  React.useEffect(() => {
    if (!onFiltersChange) return;
    const handler = setTimeout(() => {
      const normInput = normalize(inputFilters);
      const normExternal = normalize(filters);
      const same = JSON.stringify(normInput) === JSON.stringify(normExternal);
      if (same) return;
      onFiltersChange(normInput);
      onPageChange(0);
    }, filterDebounceMs);
    return () => clearTimeout(handler);
  }, [inputFilters, filterDebounceMs]); // eslint-disable-line react-hooks/exhaustive-deps

  const debouncing = React.useMemo(() => {
    const normInput = normalize(inputFilters);
    const normExternal = normalize(filters);
    return JSON.stringify(normInput) !== JSON.stringify(normExternal);
  }, [inputFilters, filters]);

  // Keyboard shortcut '/' -> focus first text filter
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const active = document.activeElement as HTMLElement | null;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'SELECT' || active.isContentEditable)) return;
        if (textFilterRefs.current[0]) {
          e.preventDefault();
          textFilterRefs.current[0].focus();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function clearFilters() {
    if (!onFiltersChange) return;
    setInputFilters({});
    onFiltersChange({});
    onPageChange(0);
  }

  const hasFilters = !!onFiltersChange && columns.some(c => c.sortField);

  const columnHeaderByField = React.useMemo(() => {
    const map: Record<string,string> = {};
    columns.forEach(c => { if (c.sortField) map[c.sortField] = typeof c.header === 'string' ? c.header : c.id; });
    return map;
  }, [columns]);

  // Active filter chips (use applied filters, not pending input)
  const activeFilterEntries = Object.entries(filters);

  const CLEAR_SELECT_VALUE = '__ALL__'; // sentinel for unselected/clear state

  return (
    <div className="w-full space-y-3">
      {hasFilters && showFilterChips && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-sm font-medium">Filtros</span>
          {activeFilterEntries.length === 0 && <span className="text-muted-foreground">(ninguno)</span>}
          {activeFilterEntries.map(([field, value]) => (
            <Badge key={field} variant="outline" className="pl-2 pr-1 py-1 flex items-center gap-1">
              <span className="font-medium">{columnHeaderByField[field] || field}:</span>
              <span className="truncate max-w-[140px]">{value}</span>
              <button
                onClick={() => updateSelectFilter(field, '')}
                className="inline-flex items-center justify-center rounded hover:bg-muted/70 transition-colors p-0.5"
                aria-label="Quitar filtro"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {activeFilterEntries.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="h-7 px-2 gap-1">
              <X className="h-3 w-3" /> Limpiar todo
            </Button>
          )}
          {debouncing && (
            <span className="flex items-center gap-1 text-muted-foreground animate-pulse">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
              aplicando…
            </span>
          )}
        </div>
      )}
      {/* Table shell */}
      <div className="overflow-x-auto rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => {
                // ...existing code for sort header...
                const sortable = !!col.sortField;
                const active = sortable && sort.field === col.sortField;
                return (
                  <TableHead
                    key={col.id}
                    style={col.width ? { width: col.width } : undefined}
                    className={[col.className ?? "", sortable ? "cursor-pointer select-none" : ""].join(" ")}
                    onClick={sortable ? () => toggleSort(col.sortField!) : undefined}
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.header}</span>
                      {sortable && (
                        <span className="inline-flex items-center">
                          {active ? (
                            sort.dir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronUp className="h-4 w-4 opacity-20" />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
            {hasFilters && (
              <TableRow>
                {columns.map(col => {
                  if (!col.sortField) return <TableHead key={col.id} style={col.width ? { width: col.width } : undefined} />;
                  const conf = col.filter || {};
                  const type = conf.type || 'text';
                  const appliedVal = filters[col.sortField];
                  const selectValue = appliedVal ?? CLEAR_SELECT_VALUE;
                  return (
                    <TableHead key={col.id} style={col.width ? { width: col.width } : undefined}>
                      {type === 'select' && conf.options ? (
                        <Select
                          value={selectValue}
                          onValueChange={(val) => {
                            if (val === CLEAR_SELECT_VALUE) {
                              updateSelectFilter(col.sortField!, '');
                            } else {
                              updateSelectFilter(col.sortField!, val);
                            }
                          }}
                        >
                          <SelectTrigger size="sm" className="pr-6">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={CLEAR_SELECT_VALUE} size="sm">{conf.placeholder || 'Todos'}</SelectItem>
                            {conf.options.map(opt => (
                              <SelectItem key={opt.value} value={opt.value} size="sm">{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="relative">
                          <Input
                            ref={assignTextRef}
                            value={inputFilters[col.sortField] ?? ''}
                            onChange={(e) => setInputFilters(prev => ({ ...prev, [col.sortField!]: e.target.value }))}
                            placeholder={conf.placeholder || 'Filtrar…'}
                            className="h-7 text-xs pr-6"
                          />
                          {inputFilters[col.sortField] && (
                            <button
                              type="button"
                              onClick={() => setInputFilters(prev => { const n={...prev}; delete n[col.sortField!]; return n; })}
                              className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted"
                              aria-label="Clear"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            )}
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={columns.length}>
                <div className="p-4 text-sm text-muted-foreground">Loading…</div>
              </TableCell></TableRow>
            )}
            {error && !loading && (
              <TableRow><TableCell colSpan={columns.length}>
                <div className="p-4 text-sm text-red-600">Error: {error}</div>
              </TableCell></TableRow>
            )}
            {!loading && !error && rows.length === 0 && (
              <TableRow><TableCell colSpan={columns.length}>{empty}</TableCell></TableRow>
            )}
            {!loading && !error && rows.map((row, i) => (
              <TableRow key={i}>
                {columns.map(col => (
                  <TableCell key={col.id} className={col.className}>{col.accessor(row)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          Page <span className="font-medium">{page + 1}</span> of <span className="font-medium">{totalPages}</span> • {total?.toLocaleString?.() ?? total} total
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm">Rows:</label>
          <Select value={String(size)} onValueChange={(val) => { onSizeChange(Number(val)); onPageChange(0); }}>
            <SelectTrigger size="sm" className="w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['10','25','50','100'].map(n => (
                <SelectItem key={n} value={n} size="sm">{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => onPageChange(0)} disabled={page === 0} className="h-8" title="First">
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(page - 1, 0))} disabled={page === 0} className="h-8">
              Prev
            </Button>
            <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page + 1 >= totalPages} className="h-8">
              Next
            </Button>
            <Button variant="outline" size="sm" onClick={() => onPageChange(totalPages - 1)} disabled={page + 1 >= totalPages} className="h-8" title="Last">
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}