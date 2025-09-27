import * as React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight } from "lucide-react";

export type SortDir = "asc" | "desc";
export type Sort = { field: string; dir: SortDir };

export type Column<T> = {
  id: string;
  header: React.ReactNode;
  accessor: (row: T) => React.ReactNode;
  sortField?: string;         // enables clickable header
  className?: string;
  width?: string;
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

  // handlers
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  onSortChange: (sort: Sort) => void;

  empty?: React.ReactNode;
};

export function DataTable<T>({
                                         columns, rows, total, loading, error,
                                         page, size, sort,
                                         onPageChange, onSizeChange, onSortChange,
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

  return (
    <div className="w-full space-y-3">
      <div className="overflow-x-auto rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => {
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
          <select
            value={size}
            onChange={(e) => { onSizeChange(Number(e.target.value)); onPageChange(0); }}
            className="border rounded-md px-2 py-1 text-sm"
          >
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>

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