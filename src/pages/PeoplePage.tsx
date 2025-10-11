import AdminLayout from '@/layouts/AdminLayout';
import PeopleTable from '@/components/PeopleTable';

export function PeoplePage() {
  return (
    <AdminLayout>
      <PeopleTable />
    </AdminLayout>
  );
}
