import * as React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight } from "lucide-react";

export type SortDir = "asc" | "desc";
export type Sort = { field: string; dir: SortDir };

export type Column<T> = {
  /** Unique column id (used for key) */
  id: string;
  /** Column header label or node */
  header: React.ReactNode;
  /** Access a value from a row (keeps component generic) */
  accessor: (row: T) => React.ReactNode;
  /** If sortable, provide the field name the backend expects for ORDER BY */
  sortField?: string;
  /** Optional column styles */
  className?: string;
  /** Optional fixed width (e.g. "160px") */
  width?: string;
};

export type FetchParams = {
  page: number;
  size: number;
  sort: Sort;
  /** optional passthrough filter bag */
  filters?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
};

export type FetchResult<T> = {
  items: T[];
  total: number; // for classic pagination
};

type DataTableProps<T> = {
  columns: Column<T>[];
  fetcher: (p: FetchParams) => Promise<FetchResult<T>>;
  /** defaults */
  initialPage?: number;
  initialSize?: number;
  initialSort?: Sort;
  /** any filters you want to include in every request */
  filters?: Record<string, string | number | boolean | undefined | null>;
  /** row key resolver (defaults to index) */
  rowKey?: (row: T, index: number) => React.Key;
  /** optional: controlled external state listeners */
  onStateChange?: (s: { page: number; size: number; sort: Sort }) => void;
  /** empty state node */
  empty?: React.ReactNode;
};

export function DataTable<T>({
                               columns,
                               fetcher,
                               initialPage = 0,
                               initialSize = 25,
                               initialSort = { field: columns.find(c => c.sortField)?.sortField ?? "id", dir: "desc" },
                               filters,
                               rowKey,
                               onStateChange,
                               empty = <div className="text-sm text-muted-foreground p-4">No data</div>,
                             }: DataTableProps<T>) {
  const [page, setPage] = React.useState(initialPage);
  const [size, setSize] = React.useState(initialSize);
  const [sort, setSort] = React.useState<Sort>(initialSort);

  const [rows, setRows] = React.useState<T[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // fetch on changes
  React.useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    fetcher({ page, size, sort, filters, signal: ctrl.signal })
      .then(({ items, total }) => {
        setRows(items);
        setTotal(total ?? 0);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message ?? "Failed to load");
      })
      .finally(() => setLoading(false));

    onStateChange?.({ page, size, sort });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, sort, JSON.stringify(filters)]);

  const totalPages = Math.max(1, Math.ceil(total / size));

  function toggleSort(nextField: string) {
    setPage(0);
    setSort(prev => {
      if (prev.field === nextField) {
        return { field: nextField, dir: prev.dir === "asc" ? "desc" : "asc" };
      } else {
        return { field: nextField, dir: "asc" };
      }
    });
  }

  return (
    <div className="w-full space-y-3">
      <div className="overflow-x-auto rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => {
                const isSortable = !!col.sortField;
                const isActive = isSortable && sort.field === col.sortField;
                return (
                  <TableHead
                    key={col.id}
                    style={col.width ? { width: col.width } : undefined}
                    className={[
                      col.className ?? "",
                      isSortable ? "cursor-pointer select-none" : "",
                    ].join(" ")}
                    onClick={isSortable ? () => toggleSort(col.sortField!) : undefined}
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.header}</span>
                      {isSortable && (
                        <span className="inline-flex items-center">
                          {isActive ? (
                            sort.dir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          ) : (
                            // faint indicator for sortable
                            <ChevronUp className="h-4 w-4 opacity-20" />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="p-4 text-sm text-muted-foreground">Loading…</div>
                </TableCell>
              </TableRow>
            )}
            {error && !loading && (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="p-4 text-sm text-red-600">Error: {error}</div>
                </TableCell>
              </TableRow>
            )}
            {!loading && !error && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length}>{empty}</TableCell>
              </TableRow>
            )}
            {!loading && !error && rows.map((row, i) => (
              <TableRow key={rowKey ? rowKey(row, i) : i}>
                {columns.map(col => (
                  <TableCell key={col.id} className={col.className}>
                    {col.accessor(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* footer controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          Page <span className="font-medium">{page + 1}</span> of <span className="font-medium">{totalPages}</span> •{" "}
          {total.toLocaleString()} total
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm">Rows:</label>
          <select
            value={size}
            onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
            className="border rounded-md px-2 py-1 text-sm"
          >
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(0)}
              disabled={page === 0}
              className="h-8"
              title="First"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(p - 1, 0))}
              disabled={page === 0}
              className="h-8"
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => (p + 1 < totalPages ? p + 1 : p))}
              disabled={page + 1 >= totalPages}
              className="h-8"
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(totalPages - 1)}
              disabled={page + 1 >= totalPages}
              className="h-8"
              title="Last"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}