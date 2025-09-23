import { useProjects } from "@/hooks/useProjects";
import { ProjectTable } from "@/components/ProjectTable";
import AdminLayout from "@/layouts/AdminLayout.tsx";

export function ProjectsPage() {
  const { data, isLoading, isError, error } = useProjects();

  return (
    <AdminLayout>
      {isLoading && <p>Loading…</p>}
      {isError && <p className="text-red-600">Error: {(error as Error)?.message}</p>}
      {!isLoading && !isError && <ProjectTable projects={data ?? []} />}
    </AdminLayout>
  );
}