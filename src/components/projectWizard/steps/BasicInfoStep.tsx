import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { ProjectDraft } from '../types';
import { SUBTYPE_OPTIONS } from '../types';
import * as React from 'react';
import { useCareers } from '@/hooks/useCareers';

interface DomainItem { publicId: string; name: string; display?: string }

interface Props {
  draft: ProjectDraft;
  onPatch: (patch: Partial<ProjectDraft>) => void;
  domainQuery: string;
  setDomainQuery: (v: string) => void;
  domainItems: DomainItem[];
}

// NEW: mapping for type labels (UI localized)
const TYPE_LABELS: Record<string,string> = { THESIS: 'Tesis', FINAL_PROJECT: 'Proyecto Final' };

export function BasicInfoStep({ draft, onPatch, domainQuery, setDomainQuery, domainItems }: Props) {
  const { data: careersData } = useCareers();
  const careers = careersData?.items ?? [];

  function toggleSubtype(st: string) {
    onPatch({ subtypes: draft.subtypes.includes(st) ? draft.subtypes.filter(x => x !== st) : [...draft.subtypes, st] });
  }

  // NEW: ensure default date (today) if none set
  React.useEffect(() => {
    if (!draft.initialSubmission) {
      const today = new Date();
      const iso = today.toISOString().slice(0,10);
      onPatch({ initialSubmission: iso });
    }
  }, [draft.initialSubmission, onPatch]);

  const dateValue = draft.initialSubmission || new Date().toISOString().slice(0,10);

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">Título *</label>
        <Input value={draft.title} onChange={e => onPatch({ title: e.target.value })} placeholder="Título del proyecto" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Tipo *</label>
          <Select value={draft.type} onValueChange={val => onPatch({ type: val })}>
            <SelectTrigger><SelectValue placeholder="Seleccione tipo" /></SelectTrigger>
            <SelectContent>
              {Object.entries(TYPE_LABELS).map(([value,label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Fecha de carga</label>
          <Input type="date" value={dateValue} onChange={e => onPatch({ initialSubmission: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Carrera *</label>
        <div className="flex flex-wrap gap-2">
          {careers.map(career => {
            const isSelected = draft.career?.publicId === career.publicId;
            return (
              <button
                key={career.publicId}
                type="button"
                onClick={() => onPatch({ career: { publicId: career.publicId, name: career.name } })}
                className={`px-3 py-1 rounded-md border text-xs ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted hover:bg-muted/70'}`}
              >
                {career.name}
              </button>
            );
          })}
          {careers.length === 0 && <span className="text-xs text-muted-foreground">Cargando carreras...</span>}
        </div>
        {draft.career && (
          <div className="text-xs text-muted-foreground">
            Seleccionada: <Badge variant="secondary">{draft.career.name}</Badge>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Subtipos</label>
        <div className="flex flex-wrap gap-2">
          {SUBTYPE_OPTIONS.map(opt => {
            const active = draft.subtypes.includes(opt);
            return (
              <button key={opt} type="button" onClick={() => toggleSubtype(opt)} className={`px-3 py-1 rounded-md border text-xs ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted hover:bg-muted/70'}`}>{opt}</button>
            );
          })}
          {draft.subtypes.length === 0 && <span className="text-xs text-muted-foreground">(ninguno)</span>}
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Dominio de aplicación</label>
        <Input value={domainQuery} onChange={e => setDomainQuery(e.target.value)} placeholder="Buscar dominio" />
        {!!domainItems.length && (
          <div className="max-h-40 overflow-auto border rounded-md divide-y text-sm bg-background">
            {domainItems.map(d => (
              <button key={d.publicId} type="button" onClick={() => { onPatch({ applicationDomain: { publicId: d.publicId, name: d.name } }); setDomainQuery(''); }} className="w-full text-left px-2 py-1 hover:bg-accent">
                {d.display || d.name}
              </button>
            ))}
          </div>
        )}
        {draft.applicationDomain && (
          <div className="text-xs flex items-center gap-2">Seleccionado: <Badge variant="secondary">{draft.applicationDomain.name}</Badge>
            <button onClick={() => onPatch({ applicationDomain: null })} className="text-muted-foreground hover:underline">Quitar</button>
          </div>
        )}
      </div>
    </div>
  );
}
