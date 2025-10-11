import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PersonPills } from '../PersonPills';
import type { ProjectDraft, PersonBase } from '../types';
import { createPerson } from '@/api/people';
import { createProfessor } from '@/api/professors';
import { useSearchProfessors } from '@/hooks/useSearchProfessors';
import { useSearchPeople } from '@/hooks/useSearchPeople';
import { parsePersonInput } from '../parsePerson';

interface Props {
  draft: ProjectDraft;
  onPatch: (patch: Partial<ProjectDraft>) => void;
}

type PersonListKey = 'directors' | 'codirectors' | 'collaborators';

function ensureId(p: { publicId?: string; id?: string }): string {
  const id = p.publicId || p.id;
  if (!id) throw new Error('Persona sin identificador');
  return id;
}

export function PeopleStep({ draft, onPatch }: Props) {
  // queries
  const [dirQuery, setDirQuery] = useState('');
  const [coDirQuery, setCoDirQuery] = useState('');
  const [collabQuery, setCollabQuery] = useState('');

  const { data: dirResults } = useSearchProfessors(dirQuery);
  const { data: coDirResults } = useSearchProfessors(coDirQuery);
  const { data: collabResults } = useSearchPeople(collabQuery);
  const dirItems = dirResults?.items ?? [];
  const coDirItems = coDirResults?.items ?? [];
  const collabItems = collabResults?.items ?? [];

  // inline creation simplified
  const [showNewDirector, setShowNewDirector] = useState(false);
  const [showNewCoDirector, setShowNewCoDirector] = useState(false);
  const [showNewCollaborator, setShowNewCollaborator] = useState(false);

  const [newDirector, setNewDirector] = useState({ name: '', lastname: '', email: '' });
  const [newCoDirector, setNewCoDirector] = useState({ name: '', lastname: '', email: '' });
  const [newCollaborator, setNewCollaborator] = useState({ name: '', lastname: '', email: '' });
  const [creating, setCreating] = useState<PersonListKey | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  function addTo(key: PersonListKey, item: PersonBase) {
    const normalized: PersonBase = { publicId: item.publicId || `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`, name: item.name, lastname: item.lastname, email: item.email || '' };
    const next = [...draft[key], normalized];
    onPatch({ [key]: next } as Pick<ProjectDraft, typeof key>);
  }
  function removeFrom(key: PersonListKey, index: number) {
    const next = draft[key].filter((_, i) => i !== index);
    onPatch({ [key]: next } as Pick<ProjectDraft, typeof key>);
  }

  async function handleCreatePerson(target: PersonListKey) {
    try {
      setCreateError(null); setCreating(target);
      const data = target === 'directors' ? newDirector : target === 'codirectors' ? newCoDirector : newCollaborator;
      if (!data.name || !data.lastname) { setCreateError('Nombre y apellido requeridos'); return; }
      const person = await createPerson({ name: data.name, lastname: data.lastname });
      const personId = ensureId(person);
      if ((target === 'directors' || target === 'codirectors') && data.email) {
        try { await createProfessor({ personPublicId: personId, email: data.email }); } catch { /* ignore professor creation error */ }
      }
      addTo(target, { publicId: personId, name: person.name, lastname: person.lastname, email: data.email });
      if (target === 'directors') { setNewDirector({ name:'', lastname:'', email:'' }); setShowNewDirector(false);}
      else if (target === 'codirectors') { setNewCoDirector({ name:'', lastname:'', email:'' }); setShowNewCoDirector(false);}
      else { setNewCollaborator({ name:'', lastname:'', email:'' }); setShowNewCollaborator(false);}
    } catch (e) { const msg = e instanceof Error ? e.message : String(e); setCreateError(msg || 'Error creando persona'); } finally { setCreating(null); }
  }

  function addManual(key: PersonListKey, raw: string) {
    const person = parsePersonInput(raw);
    if (!person) return;
    addTo(key, person);
  }

  return (
    <div className="space-y-8 p-4">
      {/* Directors */}
      <div className="space-y-2">
        <h4 className="font-medium">Directores *</h4>
        <div className="flex gap-2 mb-2">
          <Input value={dirQuery} onChange={e => setDirQuery(e.target.value)} placeholder="Apellido, Nombre o búsqueda" />
          <Button type="button" variant="outline" disabled={!dirQuery.trim()} onClick={() => { addManual('directors', dirQuery); setDirQuery(''); }}>Añadir manual</Button>
        </div>
        {!!dirItems.length && <div className="border rounded-md max-h-36 overflow-auto divide-y text-sm mb-2">{dirItems.map(p => (
          <button key={p.publicId} onClick={() => { addTo('directors', { publicId: p.publicId, name: p.name, lastname: p.lastname, email: p.email || '' }); setDirQuery(''); }} className="w-full text-left px-2 py-1 hover:bg-accent">{p.display}</button>
        ))}</div>}
        <PersonPills list={draft.directors} onRemove={(i) => removeFrom('directors', i)} />
        <div className="flex items-center gap-2 flex-wrap">
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewDirector(s => !s)}>{showNewDirector? 'Cancelar':'Nuevo Director'}</Button>
        </div>
        {showNewDirector && (
          <div className="border rounded-md p-3 space-y-2 bg-muted/30">
            <div className="flex gap-2 flex-wrap">
              <Input placeholder="Nombre *" value={newDirector.name} onChange={e=>setNewDirector(d=>({...d,name:e.target.value}))} className="h-8" />
              <Input placeholder="Apellido *" value={newDirector.lastname} onChange={e=>setNewDirector(d=>({...d,lastname:e.target.value}))} className="h-8" />
              <Input placeholder="Email *" value={newDirector.email} onChange={e=>setNewDirector(d=>({...d,email:e.target.value}))} className="h-8" />
              <Button disabled={creating==='directors'} onClick={()=>handleCreatePerson('directors')} className="h-8">{creating==='directors'? 'Creando...' : 'Guardar'}</Button>
            </div>
            {createError && creating==='directors' && <div className="text-xs text-red-600">{createError}</div>}
          </div>
        )}
      </div>
      {/* Co-directors */}
      <div className="space-y-2">
        <h4 className="font-medium">Co-directores</h4>
        <div className="flex gap-2 mb-2">
          <Input value={coDirQuery} onChange={e => setCoDirQuery(e.target.value)} placeholder="Apellido, Nombre o búsqueda" />
          <Button type="button" variant="outline" disabled={!coDirQuery.trim()} onClick={() => { addManual('codirectors', coDirQuery); setCoDirQuery(''); }}>Añadir manual</Button>
        </div>
        {!!coDirItems.length && <div className="border rounded-md max-h-36 overflow-auto divide-y text-sm mb-2">{coDirItems.map(p => (
          <button key={p.publicId} onClick={() => { addTo('codirectors', { publicId: p.publicId, name: p.name, lastname: p.lastname, email: p.email || '' }); setCoDirQuery(''); }} className="w-full text-left px-2 py-1 hover:bg-accent">{p.display}</button>
        ))}</div>}
        <PersonPills list={draft.codirectors} onRemove={(i) => removeFrom('codirectors', i)} />
        <div className="flex items-center gap-2 flex-wrap">
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewCoDirector(s => !s)}>{showNewCoDirector? 'Cancelar':'Nuevo Co-director'}</Button>
        </div>
        {showNewCoDirector && (
          <div className="border rounded-md p-3 space-y-2 bg-muted/30">
            <div className="flex gap-2 flex-wrap">
              <Input placeholder="Nombre *" value={newCoDirector.name} onChange={e=>setNewCoDirector(d=>({...d,name:e.target.value}))} className="h-8" />
              <Input placeholder="Apellido *" value={newCoDirector.lastname} onChange={e=>setNewCoDirector(d=>({...d,lastname:e.target.value}))} className="h-8" />
              <Input placeholder="Email *" value={newCoDirector.email} onChange={e=>setNewCoDirector(d=>({...d,email:e.target.value}))} className="h-8" />
              <Button disabled={creating==='codirectors'} onClick={()=>handleCreatePerson('codirectors')} className="h-8">{creating==='codirectors'? 'Creando...' : 'Guardar'}</Button>
            </div>
            {createError && creating==='codirectors' && <div className="text-xs text-red-600">{createError}</div>}
          </div>
        )}
      </div>
      {/* Collaborators */}
      <div className="space-y-2">
        <h4 className="font-medium">Colaboradores</h4>
        <div className="flex gap-2 mb-2">
          <Input value={collabQuery} onChange={e => setCollabQuery(e.target.value)} placeholder="Apellido, Nombre o búsqueda" />
          <Button type="button" variant="outline" disabled={!collabQuery.trim()} onClick={() => { addManual('collaborators', collabQuery); setCollabQuery(''); }}>Añadir manual</Button>
        </div>
        {!!collabItems.length && <div className="border rounded-md max-h-36 overflow-auto divide-y text-sm mb-2">{collabItems.map(p => (
          <button key={p.publicId} onClick={() => { addTo('collaborators', { publicId: p.publicId, name: p.name, lastname: p.lastname, email: p.email || '' }); setCollabQuery(''); }} className="w-full text-left px-2 py-1 hover:bg-accent">{p.display}</button>
        ))}</div>}
        <PersonPills list={draft.collaborators} onRemove={(i) => removeFrom('collaborators', i)} />
        <div className="flex items-center gap-2 flex-wrap">
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewCollaborator(s => !s)}>{showNewCollaborator? 'Cancelar':'Nuevo Colaborador'}</Button>
        </div>
        {showNewCollaborator && (
          <div className="border rounded-md p-3 space-y-2 bg-muted/30">
            <div className="flex gap-2 flex-wrap">
              <Input placeholder="Nombre *" value={newCollaborator.name} onChange={e=>setNewCollaborator(d=>({...d,name:e.target.value}))} className="h-8" />
              <Input placeholder="Apellido *" value={newCollaborator.lastname} onChange={e=>setNewCollaborator(d=>({...d,lastname:e.target.value}))} className="h-8" />
              <Input placeholder="Email *" value={newCollaborator.email} onChange={e=>setNewCollaborator(d=>({...d,email:e.target.value}))} className="h-8" />
              <Button disabled={creating==='collaborators'} onClick={()=>handleCreatePerson('collaborators')} className="h-8">{creating==='collaborators'? 'Creando...' : 'Guardar'}</Button>
            </div>
            {createError && creating==='collaborators' && <div className="text-xs text-red-600">{createError}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
