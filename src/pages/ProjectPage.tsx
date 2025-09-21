import { useProjects } from "@/hooks/useProjects";
import { ProjectTable } from "@/components/ProjectTable";
import AdminLayout from "@/layouts/AdminLayout.tsx";

export function ProjectsPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useProjects();

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button onClick={() => refetch()} disabled={isFetching} className="border px-3 py-1 rounded">
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {isLoading && <p>Loading…</p>}
      {isError && <p className="text-red-600">Error: {(error as Error)?.message}</p>}
      {!isLoading && !isError && <ProjectTable projects={[]} />}
    </AdminLayout>
  );
}