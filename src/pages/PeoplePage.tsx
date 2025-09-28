import AdminLayout from '@/layouts/AdminLayout';

export function PeoplePage() {
  return (
    <AdminLayout>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Personas</h2>
        <p className="text-sm text-muted-foreground">Use el menú lateral para consultar profesores o alumnos.</p>
      </div>
    </AdminLayout>
  );
}

