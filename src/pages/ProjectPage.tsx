import ProjectTable from "@/components/ProjectTable";
import AdminLayout from "@/layouts/AdminLayout.tsx";

export function ProjectsPage() {
  return (
    <AdminLayout>
      <ProjectTable />
    </AdminLayout>
  );
}