import * as React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOptionalToast } from '@/components/ui/toast';
import { setProjectTags } from '@/api/projects';
import { useQueryClient } from '@tanstack/react-query';
import type { Project } from '@/types/Project';
import { X, Plus, Tag as TagIcon, Loader2 } from 'lucide-react';
import { useAllTags } from '@/hooks/useAllTags';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface Props { project: Pick<Project,'publicId'|'tags'|'title'> | null; open: boolean; onOpenChange: (o:boolean)=>void; }

export function ProjectTagsSheet({ project, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const { push } = useOptionalToast();
  const [selected, setSelected] = React.useState<string[]>([]); // tag publicIds
  const [query, setQuery] = React.useState('');
  const { data, isLoading, error } = useAllTags();
  const allTags = data?.items || [];
  const [saving, setSaving] = React.useState(false);

  // Sync when opening
  React.useEffect(() => {
    if (open && project) {
      setSelected((project.tags||[]).map(t => t.publicId));
      setQuery('');
    }
    if (!open) { setSelected([]); setQuery(''); }
  }, [open, project]);

  // Merge project tags not in allTags (in case of pagination or stale cache)
  const merged = React.useMemo(() => {
    const map: Record<string, { publicId:string; name:string; description?:string }> = {};
    allTags.forEach(t => { map[t.publicId] = t; });
    (project?.tags||[]).forEach(t => { if (!map[t.publicId]) map[t.publicId] = t; });
    return Object.values(map);
  }, [allTags, project]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return merged;
    return merged.filter(t => t.name.toLowerCase().includes(q) || (t.description||'').toLowerCase().includes(q));
  }, [merged, query]);

  const ordered = React.useMemo(() => {
    // Previous behavior prioritized selected tags first; now we keep natural alphabetical order only.
    return [...filtered].sort((a,b) => a.name.localeCompare(b.name,'es',{sensitivity:'base'}));
  }, [filtered]);

  function toggle(id: string) { setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); }

  async function handleSave() {
    if (!project) return;
    try {
      setSaving(true);
      await setProjectTags(project.publicId, selected);
      push({ variant:'success', title:'Etiquetas actualizadas', message:'Se guardaron los cambios'});
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onOpenChange(false);
    } catch (e:any) {
      push({ variant:'error', title:'Error', message: e?.message || 'No se pudo guardar'});
    } finally { setSaving(false); }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[640px] px-6 py-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Etiquetas del Proyecto</SheetTitle>
        </SheetHeader>
        {!project && <div className="mt-4 text-sm text-muted-foreground">Seleccione un proyecto.</div>}
        {project && (
          <div className="mt-5 space-y-7">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold tracking-tight">Proyecto</h3>
              <div className="text-xs bg-muted/60 border rounded-md px-3 py-2 flex items-center gap-2">
                <TagIcon className="h-4 w-4" />
                <span className="font-medium leading-none line-clamp-2">{project.title}</span>
              </div>
            </section>
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold tracking-tight">Etiquetas</h3>
                {query && (
                  <button type="button" onClick={()=> setQuery('')} className="text-xs underline text-muted-foreground hover:text-foreground">Limpiar búsqueda</button>
                )}
              </div>
              <Input placeholder={isLoading? 'Cargando etiquetas...' : 'Buscar / filtrar etiquetas'} value={query} onChange={e=> setQuery(e.target.value)} disabled={isLoading} />
              {error && <div className="text-xs text-red-600">Error cargando etiquetas</div>}
              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Cargando…</div>
              )}
              {!isLoading && ordered.length === 0 && (
                <div className="text-xs text-muted-foreground">No hay etiquetas que coincidan.</div>
              )}
              <div className="flex flex-wrap gap-2">
                {ordered.map(t => {
                  const active = selected.includes(t.publicId);
                  const btn = (
                    <button
                      key={t.publicId}
                      type="button"
                      onClick={()=> toggle(t.publicId)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs transition-colors ${active? 'bg-primary text-primary-foreground border-primary':'bg-muted hover:bg-muted/70'}`}
                    >
                      {active ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      <span className="truncate max-w-[120px]">{t.name}</span>
                    </button>
                  );
                  return t.description ? (
                    <Tooltip key={t.publicId}>
                      <TooltipTrigger asChild>{btn}</TooltipTrigger>
                      <TooltipContent className="max-w-xs whitespace-pre-wrap" side="top">{t.description}</TooltipContent>
                    </Tooltip>
                  ) : btn;
                })}
              </div>
              <p className="text-[11px] text-muted-foreground">Click para añadir o quitar. Se listan alfabéticamente.</p>
              {data?.truncated && (
                <p className="text-[11px] text-amber-600">Mostrando primeras {data.items.length} etiquetas de {data.total}. (Faltan más, implemente paginación si es necesario)</p>
              )}
            </section>
          </div>
        )}
        <SheetFooter className="gap-2 mt-10">
          <Button variant="outline" size="sm" onClick={()=> onOpenChange(false)}>Cerrar</Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !project}>{saving? 'Guardando…':'Guardar'}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
