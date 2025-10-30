import AdminLayout from '@/layouts/AdminLayout';
import { BackupManager } from '@/features/backup/BackupManager';

export function BackupPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Respaldo y restauración</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona copias de seguridad del sistema. Esta sección solo está disponible para usuarios administradores.
          </p>
        </div>
        <BackupManager />
      </div>
    </AdminLayout>
  );
}
