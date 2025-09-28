import * as React from 'react';
import { DataTable, type Column, type Sort } from '@/components/DataTable';
import { useStudents } from '@/hooks/useStudents';
import type { FriendlyStudent } from '@/types/FriendlyEntities';

const columns: Column<FriendlyStudent>[] = [
  { id: 'lastname', header: 'Apellido', accessor: r => r.lastname, sortField: 'lastname', filter: { type: 'text', placeholder: 'Filtrar apellido'} },
  { id: 'name', header: 'Nombre', accessor: r => r.name, sortField: 'name', filter: { type: 'text', placeholder: 'Filtrar nombre'} },
  { id: 'studentId', header: 'Legajo', accessor: r => r.studentId || '—', sortField: 'studentId', filter: { type: 'text', placeholder: 'Legajo'} },
  { id: 'careers', header: 'Carreras', accessor: r => (r.careers||[]).join(', ') },
];

export default function StudentsTable() {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(25);
  const [sort, setSort] = React.useState<Sort>({ field: 'lastname', dir: 'asc' });
  const [filters, setFilters] = React.useState<Record<string,string>>({});

  const { data, isLoading, error } = useStudents({ page, size, sort, filters });
  const list = data?.students ?? [];
  const total = data?.totalElements ?? 0;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Alumnos</h2>
      <DataTable<FriendlyStudent>
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
