export function createRestFetcher<T>(url: string) {
  return async function fetcher({ page, size, sort, filters, signal }: import("./DataTable").FetchParams) {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      sort: `${sort.field},${sort.dir}`,
    });
    if (filters) {
      for (const [k, v] of Object.entries(filters)) {
        if (v !== undefined && v !== null) params.set(k, String(v));
      }
    }
    const res = await fetch(`${url}?${params.toString()}`, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // normalize to { items, total }
    return { items: data.items as T[], total: Number(data.total ?? 0) };
  };
}