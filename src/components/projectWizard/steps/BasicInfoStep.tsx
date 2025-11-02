import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ProjectDraft } from '../types';
import { SUBTYPE_OPTIONS } from '../types';
import * as React from 'react';
import { useCareers } from '@/hooks/useCareers';
import { useAllApplicationDomains } from '@/hooks/useAllApplicationDomains';
import { SearchableMultiSelect } from '../components/SearchableMultiSelect';
import { SearchableSelect } from '../components/SearchableSelect';

interface Props {
  draft: ProjectDraft;
  onPatch: (patch: Partial<ProjectDraft>) => void;
}

const TYPE_LABELS: Record<string,string> = { THESIS: 'Tesis', FINAL_PROJECT: 'Proyecto Final' };

export function BasicInfoStep({ draft, onPatch }: Props) {
  const { data: careersData } = useCareers();
  const { data: domainsData } = useAllApplicationDomains();
  const careers = careersData?.items ?? [];
  const domainsRaw = domainsData?.items ?? [];
  const domains = [...domainsRaw].sort((a, b) => a.name.localeCompare(b.name));

  function toggleSubtype(st: string) {
    onPatch({ subtypes: draft.subtypes.includes(st) ? draft.subtypes.filter(x => x !== st) : [...draft.subtypes, st] });
  }

  React.useEffect(() => {
    if (!draft.initialSubmission) {
      const today = new Date();
      const iso = today.toISOString().slice(0,10);
      onPatch({ initialSubmission: iso });
    }
  }, [draft.initialSubmission, onPatch]);

  const dateValue = draft.initialSubmission || new Date().toISOString().slice(0,10);

  const careerItems = careers.map(c => ({
    publicId: c.publicId,
    name: c.name,
    display: c.display
  }));

  const domainItems = domains.map(d => ({
    publicId: d.publicId,
    name: d.name,
    display: d.display
  }));

  const domainIds = draft.applicationDomain ? [draft.applicationDomain.publicId] : [];

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
        <SearchableSelect
          items={careerItems}
          selectedId={draft.career?.publicId}
          onSelect={(id) => {
            const c = careers.find(x => x.publicId === id);
            if (c) onPatch({ career: { publicId: c.publicId, name: c.name } });
          }}
          placeholder="Seleccione carrera"
        />
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
      <div className="space-y-2">
        <label className="text-sm font-medium">Dominio de aplicación</label>
        <SearchableMultiSelect
          items={domainItems}
          selectedIds={domainIds}
          onSelect={(id) => {
            const d = domains.find(x => x.publicId === id);
            if (d) onPatch({ applicationDomain: { publicId: d.publicId, name: d.name } });
          }}
          onRemove={(id) => {
            if (draft.applicationDomain?.publicId === id) {
              onPatch({ applicationDomain: null });
            }
          }}
          onAddNew={() => {}}
          placeholder="Seleccione dominio"
          hideAddButton={true}
        />
      </div>
    </div>
  );
}

