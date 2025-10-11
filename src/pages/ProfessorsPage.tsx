import AdminLayout from '@/layouts/AdminLayout';
import ProfessorsTable from '@/components/ProfessorsTable';

export function ProfessorsPage() {
  return (
    <AdminLayout>
      <ProfessorsTable />
    </AdminLayout>
  );
}
