import AdminLayout from '@/layouts/AdminLayout';
import StudentsTable from '@/components/StudentsTable';

export function StudentsPage() {
  return (
    <AdminLayout>
      <StudentsTable />
    </AdminLayout>
  );
}
