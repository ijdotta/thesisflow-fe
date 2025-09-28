import * as React from 'react';
import { DataTable, type Column, type Sort } from '@/components/DataTable';
import { useProfessors } from '@/hooks/useProfessors';
import type { FriendlyPerson } from '@/types/FriendlyEntities';

const columns: Column<FriendlyPerson>[] = [
  { id: 'lastname', header: 'Apellido', accessor: r => r.lastname, sortField: 'lastname', filter: { type: 'text', placeholder: 'Filtrar apellido'} },
  { id: 'name', header: 'Nombre', accessor: r => r.name, sortField: 'name', filter: { type: 'text', placeholder: 'Filtrar nombre'} },
  { id: 'email', header: 'Email', accessor: r => r.email || '—', sortField: 'email', filter: { type: 'text', placeholder: 'Buscar email'} },
];

export default function ProfessorsTable() {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(25);
  const [sort, setSort] = React.useState<Sort>({ field: 'lastname', dir: 'asc' });
  const [filters, setFilters] = React.useState<Record<string,string>>({});

  const { data, isLoading, error } = useProfessors({ page, size, sort, filters });
  const list = data?.professors ?? [];
  const total = data?.totalElements ?? 0;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Profesores</h2>
      <DataTable<FriendlyPerson>
        columns={columns}
        rows={list}
        total={total}
        loading={isLoading}
        error={error ? String(error) : null}
        page={page}
        size={size}
        sort={sort}
        filters={filters}
        onPageChange={setPage}
        onSizeChange={setSize}
        onSortChange={setSort}
        onFiltersChange={setFilters}
        filterDebounceMs={400}
      />
    </div>
  );
}
