import type { ProjectDraft } from '../types';

interface Props { draft: ProjectDraft }

// Localized type labels
const TYPE_LABELS: Record<string,string> = { THESIS: 'Tesis', FINAL_PROJECT: 'Proyecto Final' };

export function SummaryStep({ draft }: Props) {
  const localizedType = draft.type ? (TYPE_LABELS[draft.type] || draft.type) : '—';
  return (
    <div className="space-y-6 p-4">
      <h4 className="font-semibold">Resumen</h4>
      <div className="grid gap-3 text-sm">
        <div className="flex justify-between gap-4"><span className="font-medium">Título</span><span className="text-right max-w-[60%] break-words">{draft.title || '—'}</span></div>
        <div className="flex justify-between gap-4"><span className="font-medium">Tipo</span><span>{localizedType}</span></div>
        <div className="flex justify-between gap-4"><span className="font-medium">Subtipos</span><span>{draft.subtypes.join(', ') || '—'}</span></div>
        <div className="flex justify-between gap-4"><span className="font-medium">Dominio</span><span>{draft.applicationDomain?.name || '—'}</span></div>
        <div className="flex justify-between gap-4"><span className="font-medium">Fecha de carga</span><span>{draft.initialSubmission || '—'}</span></div>
        <div className="flex justify-between gap-4"><span className="font-medium">Directores</span><span className="text-right max-w-[60%] break-words">{draft.directors.map(p => [p.lastname, p.name].filter(Boolean).join(', ')).join(' • ') || '—'}</span></div>
        <div className="flex justify-between gap-4"><span className="font-medium">Co-directores</span><span className="text-right max-w-[60%] break-words">{draft.codirectors.map(p => [p.lastname, p.name].filter(Boolean).join(', ')).join(' • ') || '—'}</span></div>
        <div className="flex justify-between gap-4"><span className="font-medium">Colaboradores</span><span className="text-right max-w-[60%] break-words">{draft.collaborators.map(p => [p.lastname, p.name].filter(Boolean).join(', ')).join(' • ') || '—'}</span></div>
        <div className="flex justify-between gap-4"><span className="font-medium">Alumnos</span><span className="text-right max-w-[60%] break-words">{draft.students.map(s => [s.lastname, s.name].filter(Boolean).join(', ')).join(' • ') || '—'}</span></div>
      </div>
    </div>
  );
}
