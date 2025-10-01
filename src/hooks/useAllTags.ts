import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/axios';
import { mapApiTagToFriendly } from '@/mapper/apiToFriendly';
import type { FriendlyTag } from '@/types/FriendlyEntities';

interface RawTag { publicId: string; name: string; description?: string }
interface PageLike { content: RawTag[]; totalElements?: number; totalPages?: number; size?: number; number?: number }

async function attemptUnpaginated(): Promise<{ items: RawTag[]; total: number; paged: boolean }> {
  try {
    const { data } = await api.get('/tags');
    if (Array.isArray(data)) {
      return { items: data as RawTag[], total: data.length, paged: false };
    }
    if (data && Array.isArray(data.content)) {
      return { items: data.content as RawTag[], total: data.totalElements ?? data.content.length, paged: true };
    }
    return { items: [], total: 0, paged: false };
  } catch {
    return { items: [], total: 0, paged: false };
  }
}

async function attemptSinglePage(size: number): Promise<PageLike | null> {
  try {
    const { data } = await api.get('/tags', { params: { page: 0, size, sort: 'name,asc' } });
    if (data && Array.isArray(data.content)) return data as PageLike;
    if (Array.isArray(data)) return { content: data as RawTag[], totalElements: data.length, totalPages: 1, size: data.length, number: 0 };
    return null;
  } catch { return null; }
}

async function fetchPagedAll(total: number, firstPage: PageLike, pageSize: number, maxTotal: number): Promise<RawTag[]> {
  const out: RawTag[] = [...firstPage.content];
  const totalPages = firstPage.totalPages ?? Math.ceil(total / (firstPage.size || pageSize));
  let page = 1;
  while (page < totalPages && out.length < total && out.length < maxTotal) {
    try {
      const { data } = await api.get('/tags', { params: { page, size: pageSize, sort: 'name,asc' } });
      const content = Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : []);
      if (!content.length) break;
      for (const t of content) {
        if (!out.find(x => x.publicId === t.publicId)) out.push(t);
      }
      page++;
    } catch { break; }
  }
  return out;
}

async function adaptiveFetchAll(maxTotal = 5000): Promise<{ items: RawTag[]; total: number; truncated: boolean }> {
  // 1. Try unpaginated (maybe backend returns full array)
  const first = await attemptUnpaginated();
  if (!first.paged) {
    return { items: first.items, total: first.total, truncated: first.items.length < first.total }; // if total mismatch (rare), truncated true
  }

  // 2. Backend is paginated. Try progressively larger single page to get everything in one go.
  const candidateSizes = [50, 200, 500, 1000];
  for (const sz of candidateSizes) {
    const page = await attemptSinglePage(sz);
    if (!page) continue;
    const total = page.totalElements ?? page.content.length;
    if (page.content.length >= total || total <= sz) {
      return { items: page.content, total, truncated: page.content.length < total };
    }
    // If we still didn't capture all, fall back to full pagination with this size.
    const all = await fetchPagedAll(total, page, sz, maxTotal);
    return { items: all, total, truncated: all.length < total };
  }

  // 3. Fallback: nothing worked, return empty
  return { items: [], total: 0, truncated: false };
}

function normalizeUnique(items: RawTag[]): RawTag[] {
  const seen = new Set<string>();
  return items.map((t, idx) => {
    let pid = (t as any).publicId || (t as any).id || '';
    if (!pid || seen.has(pid)) {
      pid = `tag-${idx}-${t.name}`; // synthetic unique id
    }
    seen.add(pid);
    return { ...t, publicId: pid };
  });
}

export function useAllTags(maxTotal = 5000) {
  return useQuery({
    queryKey: ['tags','all','adaptive',{ maxTotal }],
    queryFn: async () => {
      const raw = await adaptiveFetchAll(maxTotal);
      raw.items = normalizeUnique(raw.items);
      return raw;
    },
    staleTime: 60_000,
    select: (raw): { items: FriendlyTag[]; total: number; truncated: boolean } => ({
      items: raw.items.map(mapApiTagToFriendly),
      total: raw.total,
      truncated: raw.truncated,
    })
  });
}
