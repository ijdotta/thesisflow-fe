import * as React from 'react';
import {Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter} from '@/components/ui/sheet';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Badge} from '@/components/ui/badge';
import {X} from 'lucide-react';
import {api} from '@/api/axios';
import { useSearchProfessors } from '@/hooks/useSearchProfessors';
import { useSearchPeople } from '@/hooks/useSearchPeople';
import { useSearchStudents } from '@/hooks/useSearchStudents';
import { useSearchApplicationDomains } from '@/hooks/useSearchApplicationDomains';
import { useCareers } from '@/hooks/useCareers';
import { useDebounce } from '@/hooks/useDebounce';
import { createPerson } from '@/api/people';
import { createProfessor } from '@/api/professors';
import { createStudent, setStudentCareers } from '@/api/students';
import { createProject, setProjectApplicationDomain, setProjectParticipants } from '@/api/projects';

// --- Draft Types ---
interface PersonBase {
  publicId?: string; // local temp for manual entities
  name: string;
  lastname: string;
  email?: string;
}

interface StudentDraft extends PersonBase {
  studentId?: string;
  careers: string[]; // store career publicIds
}

interface Domain {
  publicId: string;
  name: string;
}

interface ProjectDraft {
  title: string;
  type: string;
  subtypes: string[];
  applicationDomain?: Domain | null;
  initialSubmission?: string;
  directors: PersonBase[];
  codirectors: PersonBase[];
  collaborators: PersonBase[];
  students: StudentDraft[];
}

const emptyDraft: ProjectDraft = {
  title: '',
  type: '',
  subtypes: [],
  applicationDomain: null,
  initialSubmission: undefined,
  directors: [],
  codirectors: [],
  collaborators: [],
  students: [],
};

// Utility component for pill lists
function PersonPills({list, onRemove}: { list: PersonBase[]; onRemove: (i: number) => void }) {
  if (!list.length) return <div className="text-xs text-muted-foreground">Ninguno</div>;
  return (
    <div className="flex flex-wrap gap-1">
      {list.map((p, i) => (
        <Badge key={i} variant="outline" className="gap-1 pr-1">
          {p.lastname}, {p.name}
          <button onClick={() => onRemove(i)} className="hover:bg-muted rounded p-0.5" aria-label="remove"><X
            className="h-3 w-3"/></button>
        </Badge>
      ))}
    </div>
  );
}

const SUBTYPE_OPTIONS = ['Investigación', 'Extensión', 'Vinculación'];

export default function CreateProjectWizard({onCreated}: { onCreated?: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<ProjectDraft>({...emptyDraft});

  // Async search state (simplified)
  const [dirQuery, setDirQuery] = React.useState('');
  const [coDirQuery, setCoDirQuery] = React.useState('');
  const [collabQuery, setCollabQuery] = React.useState('');
  const [studentQuery, setStudentQuery] = React.useState('');
  const [domainQuery, setDomainQuery] = React.useState('');

  const dDir = useDebounce(dirQuery, 300);
  const dCoDir = useDebounce(coDirQuery, 300);
  const dCollab = useDebounce(collabQuery, 300);
  const dStudent = useDebounce(studentQuery, 300);
  const dDomain = useDebounce(domainQuery, 300);

  const { data: dirResults } = useSearchProfessors(dDir);
  const { data: coDirResults } = useSearchProfessors(dCoDir);
  const { data: collabResults } = useSearchPeople(dCollab);
  const { data: studentResults } = useSearchStudents(dStudent);
  const { data: domainResults } = useSearchApplicationDomains(dDomain);
  const { data: careerData, isLoading: careersLoading } = useCareers();
  const dirItems = dirResults?.items ?? [];
  const coDirItems = coDirResults?.items ?? [];
  const collabItems = collabResults?.items ?? [];
  const studentItems = studentResults?.items ?? [];
  const domainItems = domainResults?.items ?? [];
  const careerItems = careerData?.items ?? [];
  const careerList = careerItems.map(c => c.name);

  // Creation form state
  const [showNewDirector, setShowNewDirector] = React.useState(false);
  const [showNewCoDirector, setShowNewCoDirector] = React.useState(false);
  const [showNewCollaborator, setShowNewCollaborator] = React.useState(false);
  const [showNewStudent, setShowNewStudent] = React.useState(false);

  const [newDirector, setNewDirector] = React.useState({ name: '', lastname: '', email: '' });
  const [newCoDirector, setNewCoDirector] = React.useState({ name: '', lastname: '', email: '' });
  const [newCollaborator, setNewCollaborator] = React.useState({ name: '', lastname: '', email: '' });
  const [newStudent, setNewStudent] = React.useState({ name: '', lastname: '', studentId: '', email: '' });
  const [newStudentCareers, setNewStudentCareers] = React.useState<string[]>([]); // stores career publicIds now

  const [creating, setCreating] = React.useState<string | null>(null);
  const [createError, setCreateError] = React.useState<string | null>(null);

  function isTemp(publicId?: string){ return !publicId || publicId.startsWith('manual-'); }

  async function handleCreatePerson(target: 'directors' | 'codirectors' | 'collaborators') {
    try {
      setCreateError(null); setCreating(target);
      const data = target === 'directors' ? newDirector : target === 'codirectors' ? newCoDirector : newCollaborator;
      if (!data.name || !data.lastname) { setCreateError('Nombre y apellido requeridos'); return; }
      const person = await createPerson({ name: data.name, lastname: data.lastname });
      if ((target === 'directors' || target === 'codirectors') && data.email) {
        try { await createProfessor({ personPublicId: person.publicId, email: data.email }); } catch {/* ignore upgrade error */}
      }
      addTo(target, { publicId: person.publicId, name: person.name, lastname: person.lastname, email: data.email });
      if (target === 'directors') { setNewDirector({ name:'', lastname:'', email:'' }); setShowNewDirector(false);}
      if (target === 'codirectors') { setNewCoDirector({ name:'', lastname:'', email:'' }); setShowNewCoDirector(false);}
      if (target === 'collaborators') { setNewCollaborator({ name:'', lastname:'', email:'' }); setShowNewCollaborator(false);}
    } catch (e:any) {
      setCreateError(e?.message || 'Error creando persona');
    } finally { setCreating(null); }
  }

  async function handleCreateStudent() {
    try {
      setCreateError(null); setCreating('student');
      if (!newStudent.name || !newStudent.lastname) { setCreateError('Nombre y apellido requeridos'); return; }
      const person = await createPerson({ name: newStudent.name, lastname: newStudent.lastname });
      const student = await createStudent({ personPublicId: person.publicId, studentId: newStudent.studentId || undefined, email: newStudent.email || undefined });
      if (newStudentCareers.length) {
        await setStudentCareers(student.publicId || person.publicId, newStudentCareers);
      }
      addTo('students', { publicId: student.publicId || person.publicId, name: person.name, lastname: person.lastname, studentId: newStudent.studentId, careers: newStudentCareers });
      setNewStudent({ name:'', lastname:'', studentId:'', email:'' }); setNewStudentCareers([]); setShowNewStudent(false);
    } catch (e:any) {
      setCreateError(e?.message || 'Error creando alumno');
    } finally { setCreating(null); }
  }

  function updateDraft<K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) {
    setDraft(d => ({...d, [key]: value}));
  }

  function addTo(key: 'directors' | 'codirectors' | 'collaborators' | 'students', item: any) {
    if (key === 'students') {
      const normalized = { publicId: item.publicId || `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`, careers: item.careers || [], ...item };
      setDraft(d => ({...d, students: [...d.students, normalized]}));
    } else {
      const normalized = { publicId: item.publicId || `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`, ...item };
      setDraft(d => ({...d, [key]: [...(d as any)[key], normalized]}));
    }
  }

  function removeFrom(key: 'directors' | 'codirectors' | 'collaborators' | 'students', index: number) {
    setDraft(d => {
      const arr = [...(d as any)[key]];
      arr.splice(index, 1);
      return {...d, [key]: arr};
    });
  }

  function reset() {
    setDraft({...emptyDraft});
    setStep(0);
    setError(null);
  }

  // find career name helper
  function careerNameById(id: string){ return careerItems.find(c => c.publicId === id)?.name || id; }

  async function persistDirector(d: PersonBase): Promise<PersonBase> {
    if (!isTemp(d.publicId)) return d; // already persisted
    const person = await createPerson({ name: d.name, lastname: d.lastname });
    // upgrade to professor if email provided
    try { if (d.email) await createProfessor({ personPublicId: person.publicId, email: d.email }); } catch {/* ignore */}
    return { ...d, publicId: person.publicId };
  }
  async function persistCollaborator(c: PersonBase): Promise<PersonBase> {
    if (!isTemp(c.publicId)) return c;
    const person = await createPerson({ name: c.name, lastname: c.lastname });
    return { ...c, publicId: person.publicId };
  }
  async function persistStudent(s: StudentDraft): Promise<StudentDraft> {
    if (!isTemp(s.publicId)) return s;
    const person = await createPerson({ name: s.name, lastname: s.lastname });
    const student = await createStudent({ personPublicId: person.publicId, studentId: s.studentId, email: s.email });
    if (s.careers?.length) {
      // careers store publicIds already
      await setStudentCareers(student.publicId || person.publicId, s.careers);
    }
    return { ...s, publicId: student.publicId || person.publicId };
  }

  async function persistAllManualEntities() {
    // Persist students first (they may need careers association early but independent)
    const newStudents = await Promise.all(draft.students.map(persistStudent));
    const newDirectors = await Promise.all(draft.directors.map(persistDirector));
    const newCoDirectors = await Promise.all(draft.codirectors.map(persistDirector));
    const newCollaborators = await Promise.all(draft.collaborators.map(persistCollaborator));
    setDraft(d => ({ ...d, students: newStudents, directors: newDirectors, codirectors: newCoDirectors, collaborators: newCollaborators }));
    return { newStudents, newDirectors, newCoDirectors, newCollaborators };
  }

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      // 1. Persist any manual entities so we have real publicIds
      const { newStudents, newDirectors, newCoDirectors, newCollaborators } = await persistAllManualEntities();

      // 2. Create base project (without participants / domain)
      const project = await createProject({
        title: draft.title,
        type: draft.type,
        subtypes: draft.subtypes,
        initialSubmission: draft.initialSubmission || undefined,
      });

      // 3. Set application domain if chosen
      if (draft.applicationDomain?.publicId) {
        await setProjectApplicationDomain(project.publicId, draft.applicationDomain.publicId);
      }

      // 4. Build participants list (unique by publicId + role)
      const participantsMap = new Map<string, { personPublicId: string; role: 'STUDENT' | 'DIRECTOR' | 'CO_DIRECTOR' | 'COLLABORATOR' }>();
      function addParticipant(personPublicId?: string, role?: 'STUDENT' | 'DIRECTOR' | 'CO_DIRECTOR' | 'COLLABORATOR') {
        if (!personPublicId || !role) return;
        const key = personPublicId + role;
        if (!participantsMap.has(key)) participantsMap.set(key, { personPublicId, role });
      }
      newDirectors.forEach(d => addParticipant(d.publicId, 'DIRECTOR'));
      newCoDirectors.forEach(d => addParticipant(d.publicId, 'CO_DIRECTOR'));
      newCollaborators.forEach(c => addParticipant(c.publicId, 'COLLABORATOR'));
      newStudents.forEach(s => addParticipant(s.publicId, 'STUDENT'));

      const participants = Array.from(participantsMap.values());
      if (participants.length) {
        await setProjectParticipants(project.publicId, participants);
      }

      onCreated?.();
      setOpen(false);
      reset();
    } catch (e:any) {
      setError(e?.message || 'Error creando proyecto');
    } finally {
      setSaving(false);
    }
  }

  const canNext = () => {
    if (step === 0) return !!draft.title && !!draft.type;
    if (step === 1) return draft.directors.length > 0; // at least one director typical
    if (step === 2) return draft.students.length > 0; // at least one student
    return true;
  };

  // --- Helper to parse manual entries like "Lastname, Name" or single token ---
  function parsePersonInput(input: string): PersonBase | null {
    const trimmed = input.trim();
    if (!trimmed) return null;
    if (trimmed.includes(',')) {
      const [last, name] = trimmed.split(',').map(s => s.trim());
      return {lastname: last || name || '', name: name || last || ''};
    }
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) return {name: parts[0], lastname: ''};
    const lastname = parts.pop()!;
    const name = parts.join(' ');
    return {name, lastname};
  }

  function addManual(key: 'directors' | 'codirectors' | 'collaborators', raw: string) {
    const person = parsePersonInput(raw);
    if (!person) return;
    addTo(key, person);
  }

  // --- Subtypes toggle ---
  function toggleSubtype(st: string) {
    setDraft(d => ({...d, subtypes: d.subtypes.includes(st) ? d.subtypes.filter(x => x !== st) : [...d.subtypes, st]}));
  }

  // --- Step render adjustments ---
  function renderStep() {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4 p-4">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Título *</label>
              <Input value={draft.title} onChange={e => updateDraft('title', e.target.value)}
                     placeholder="Título del proyecto"/>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Tipo *</label>
                <Select value={draft.type} onValueChange={val => updateDraft('type', val)}>
                  <SelectTrigger><SelectValue placeholder="Seleccione tipo"/></SelectTrigger>
                  <SelectContent>
                    {['THESIS', 'PROJECT', 'OTHER'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Fecha de presentación</label>
                <Input type="date" value={draft.initialSubmission || ''}
                       onChange={e => updateDraft('initialSubmission', e.target.value)}/>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subtipos</label>
              <div className="flex flex-wrap gap-2">
                {SUBTYPE_OPTIONS.map(opt => {
                  const active = draft.subtypes.includes(opt);
                  return (
                    <button key={opt} type="button" onClick={() => toggleSubtype(opt)}
                            className={`px-3 py-1 rounded-md border text-xs ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted hover:bg-muted/70'}`}>{opt}</button>
                  );
                })}
                {draft.subtypes.length === 0 && <span className="text-xs text-muted-foreground">(ninguno)</span>}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Dominio de aplicación</label>
              <Input value={domainQuery} onChange={e => setDomainQuery(e.target.value)} placeholder="Buscar dominio"/>
              {!!domainItems.length && (
                <div className="max-h-40 overflow-auto border rounded-md divide-y text-sm bg-background">
                  {domainItems.map(d => (
                    <button key={d.publicId} type="button" onClick={()=>{ updateDraft('applicationDomain', { publicId: d.publicId, name: d.name }); setDomainQuery(''); }} className="w-full text-left px-2 py-1 hover:bg-accent">
                      {d.display}
                    </button>
                  ))}
                </div>
              )}
              {draft.applicationDomain && (
                <div className="text-xs flex items-center gap-2">Seleccionado: <Badge
                  variant="secondary">{draft.applicationDomain.name}</Badge>
                  <button onClick={() => updateDraft('applicationDomain', null)}
                          className="text-muted-foreground hover:underline">Quitar
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-8 p-4">
            {/* Directors */}
            <div className="space-y-2">
              <h4 className="font-medium">Directores *</h4>
              <div className="flex gap-2 mb-2">
                <Input value={dirQuery} onChange={e => setDirQuery(e.target.value)}
                       placeholder="Apellido, Nombre o búsqueda"/>
                <Button type="button" variant="outline" disabled={!dirQuery.trim()} onClick={() => {
                  addManual('directors', dirQuery);
                  setDirQuery('');
                }}>Añadir manual</Button>
              </div>
              {!!dirItems.length && <div className="border rounded-md max-h-36 overflow-auto divide-y text-sm mb-2">
                {dirItems.map(p => (
                  <button key={p.publicId} onClick={()=>{ addTo('directors', { publicId: p.publicId, name: p.name, lastname: p.lastname, email: p.email }); setDirQuery(''); }} className="w-full text-left px-2 py-1 hover:bg-accent">{p.display}</button>
                ))}
              </div>}
              <PersonPills list={draft.directors} onRemove={(i) => removeFrom('directors', i)}/>
              <div className="flex items-center gap-2 flex-wrap">
                <Button type="button" variant="ghost" size="sm" onClick={()=>setShowNewDirector(s=>!s)}>{showNewDirector? 'Cancelar' : 'Nuevo Director'}</Button>
              </div>
              {showNewDirector && (
                <div className="border rounded-md p-3 space-y-2 bg-muted/30">
                  <div className="flex gap-2">
                    <Input placeholder="Nombre" value={newDirector.name} onChange={e=>setNewDirector(d=>({...d,name:e.target.value}))} className="h-8" />
                    <Input placeholder="Apellido" value={newDirector.lastname} onChange={e=>setNewDirector(d=>({...d,lastname:e.target.value}))} className="h-8" />
                    <Input placeholder="Email (opcional)" value={newDirector.email} onChange={e=>setNewDirector(d=>({...d,email:e.target.value}))} className="h-8" />
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
                <Input value={coDirQuery} onChange={e => setCoDirQuery(e.target.value)}
                       placeholder="Apellido, Nombre o búsqueda"/>
                <Button type="button" variant="outline" disabled={!coDirQuery.trim()} onClick={() => {
                  addManual('codirectors', coDirQuery);
                  setCoDirQuery('');
                }}>Añadir manual</Button>
              </div>
              {!!coDirItems.length && <div className="border rounded-md max-h-36 overflow-auto divide-y text-sm mb-2">
                {coDirItems.map(p => (
                  <button key={p.publicId} onClick={()=>{ addTo('codirectors', { publicId: p.publicId, name: p.name, lastname: p.lastname, email: p.email }); setCoDirQuery(''); }} className="w-full text-left px-2 py-1 hover:bg-accent">{p.display}</button>
                ))}
              </div>}
              <PersonPills list={draft.codirectors} onRemove={(i) => removeFrom('codirectors', i)}/>
              <div className="flex items-center gap-2 flex-wrap">
                <Button type="button" variant="ghost" size="sm" onClick={()=>setShowNewCoDirector(s=>!s)}>{showNewCoDirector? 'Cancelar':'Nuevo Co-director'}</Button>
              </div>
              {showNewCoDirector && (
                <div className="border rounded-md p-3 space-y-2 bg-muted/30">
                  <div className="flex gap-2">
                    <Input placeholder="Nombre" value={newCoDirector.name} onChange={e=>setNewCoDirector(d=>({...d,name:e.target.value}))} className="h-8" />
                    <Input placeholder="Apellido" value={newCoDirector.lastname} onChange={e=>setNewCoDirector(d=>({...d,lastname:e.target.value}))} className="h-8" />
                    <Input placeholder="Email (opcional)" value={newCoDirector.email} onChange={e=>setNewCoDirector(d=>({...d,email:e.target.value}))} className="h-8" />
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
                <Input value={collabQuery} onChange={e => setCollabQuery(e.target.value)}
                       placeholder="Apellido, Nombre o búsqueda"/>
                <Button type="button" variant="outline" disabled={!collabQuery.trim()} onClick={() => {
                  addManual('collaborators', collabQuery);
                  setCollabQuery('');
                }}>Añadir manual</Button>
              </div>
              {!!collabItems.length &&
                  <div className="border rounded-md max-h-36 overflow-auto divide-y text-sm mb-2">
                    {collabItems.map(p => (
                      <button key={p.publicId} onClick={()=>{ addTo('collaborators', { publicId: p.publicId, name: p.name, lastname: p.lastname, email: p.email }); setCollabQuery(''); }} className="w-full text-left px-2 py-1 hover:bg-accent">{p.display}</button>
                    ))}
                  </div>}
              <PersonPills list={draft.collaborators} onRemove={(i) => removeFrom('collaborators', i)}/>
              <div className="flex items-center gap-2 flex-wrap">
                <Button type="button" variant="ghost" size="sm" onClick={()=>setShowNewCollaborator(s=>!s)}>{showNewCollaborator? 'Cancelar':'Nuevo Colaborador'}</Button>
              </div>
              {showNewCollaborator && (
                <div className="border rounded-md p-3 space-y-2 bg-muted/30">
                  <div className="flex gap-2">
                    <Input placeholder="Nombre" value={newCollaborator.name} onChange={e=>setNewCollaborator(d=>({...d,name:e.target.value}))} className="h-8" />
                    <Input placeholder="Apellido" value={newCollaborator.lastname} onChange={e=>setNewCollaborator(d=>({...d,lastname:e.target.value}))} className="h-8" />
                    <Input placeholder="Email (opcional)" value={newCollaborator.email} onChange={e=>setNewCollaborator(d=>({...d,email:e.target.value}))} className="h-8" />
                    <Button disabled={creating==='collaborators'} onClick={()=>handleCreatePerson('collaborators')} className="h-8">{creating==='collaborators'? 'Creando...' : 'Guardar'}</Button>
                  </div>
                  {createError && creating==='collaborators' && <div className="text-xs text-red-600">{createError}</div>}
                </div>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 p-4">
            <h4 className="font-medium">Alumnos *</h4>
            <div className="flex gap-2 mb-2">
              <Input value={studentQuery} onChange={e => setStudentQuery(e.target.value)}
                     placeholder="Apellido, Nombre o búsqueda"/>
              <Button type="button" variant="outline" disabled={!studentQuery.trim()} onClick={() => {
                const parsed = parsePersonInput(studentQuery);
                if (parsed) addTo('students', {...parsed});
                setStudentQuery('');
              }}>Añadir manual</Button>
            </div>
            {!!studentItems.length && <div className="border rounded-md max-h-40 overflow-auto divide-y text-sm mb-3">
              {studentItems.map(s => (
                <button key={s.publicId} onClick={()=>{ addTo('students', { publicId: s.publicId, name: s.name, lastname: s.lastname, studentId: s.studentId, careers: s.careers ?? [] }); setStudentQuery(''); }} className="w-full text-left px-2 py-1 hover:bg-accent">{s.display}</button>
              ))}
            </div>}
            <div className="space-y-3">
              {draft.students.map((s, i) => (
                <div key={i} className="border rounded-md p-3 space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    <Input className="h-8 flex-1 min-w-[120px]" placeholder="Nombre" value={s.name} onChange={e => {
                      const v = e.target.value;
                      setDraft(d => {
                        const arr = [...d.students];
                        arr[i] = {...arr[i], name: v};
                        return {...d, students: arr};
                      });
                    }}/>
                    <Input className="h-8 flex-1 min-w-[120px]" placeholder="Apellido" value={s.lastname}
                           onChange={e => {
                             const v = e.target.value;
                             setDraft(d => {
                               const arr = [...d.students];
                               arr[i] = {...arr[i], lastname: v};
                               return {...d, students: arr};
                             });
                           }}/>
                    <Input className="h-8 w-40" placeholder="Legajo" value={s.studentId || ''} onChange={e => {
                      const v = e.target.value;
                      setDraft(d => {
                        const arr = [...d.students];
                        arr[i] = {...arr[i], studentId: v};
                        return {...d, students: arr};
                      });
                    }}/>
                    <div className="flex flex-col gap-1 w-48">
                      <label className="text-xs font-medium">Carreras</label>
                      <div className="border rounded-md p-2 flex flex-wrap gap-1 min-h-8 bg-muted/30">
                        {s.careers?.length ? s.careers.map(c => (
                          <span key={c} className="text-xs px-2 py-0.5 rounded-md bg-primary/10 border border-primary/40 flex items-center gap-1">
                            {careerNameById(c)}
                            <button type="button" className="hover:text-destructive" onClick={()=>{
                              setDraft(d=>{ const arr=[...d.students]; arr[i]={...arr[i], careers: arr[i].careers.filter(x=>x!==c)}; return {...d, students:arr}; });
                            }}>
                              ×
                            </button>
                          </span>
                        )) : <span className="text-xs text-muted-foreground">Ninguna</span>}
                      </div>
                      <Select onValueChange={(val)=>{
                        if (!val) return;
                        setDraft(d=>{ const arr=[...d.students]; if(!arr[i].careers.includes(val)) arr[i]={...arr[i], careers:[...arr[i].careers, val]}; return {...d, students:arr}; });
                      }} value="">
                        <SelectTrigger className="h-8"><SelectValue placeholder="Agregar carrera" /></SelectTrigger>
                        <SelectContent>
                          {careerItems.filter(ci => !s.careers.includes(ci.publicId)).map(ci => <SelectItem key={ci.publicId} value={ci.publicId}>{ci.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {!careerList.length && !careersLoading && (
              <div className="text-xs text-yellow-600 bg-yellow-100/40 p-2 rounded-md border border-yellow-200">
                No hay carreras disponibles. Cree una carrera y vuelva para asignarla si es necesario.
              </div>
            )}
            <div className="flex items-center gap-2 mb-2">
              <Button type="button" variant="ghost" size="sm" onClick={()=>setShowNewStudent(s=>!s)}>{showNewStudent? 'Cancelar':'Nuevo Alumno'}</Button>
            </div>
            {showNewStudent && (
              <div className="border rounded-md p-3 space-y-2 bg-muted/30 mb-4">
                <div className="flex flex-wrap gap-2">
                  <Input placeholder="Nombre" value={newStudent.name} onChange={e=>setNewStudent(d=>({...d,name:e.target.value}))} className="h-8 w-40" />
                  <Input placeholder="Apellido" value={newStudent.lastname} onChange={e=>setNewStudent(d=>({...d,lastname:e.target.value}))} className="h-8 w-40" />
                  <Input placeholder="Legajo" value={newStudent.studentId} onChange={e=>setNewStudent(d=>({...d,studentId:e.target.value}))} className="h-8 w-32" />
                  <Input placeholder="Email (opcional)" value={newStudent.email} onChange={e=>setNewStudent(d=>({...d,email:e.target.value}))} className="h-8 w-52" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Carreras</label>
                  <div className="flex flex-wrap gap-2">
                    {careerItems.map(c => {
                      const active = newStudentCareers.includes(c.publicId);
                      return (
                        <button key={c.publicId} type="button" onClick={()=>setNewStudentCareers(list=> active? list.filter(id=>id!==c.publicId) : [...list,c.publicId])} className={`px-2 py-1 rounded-md border text-xs ${active? 'bg-primary text-primary-foreground border-primary':'bg-muted hover:bg-muted/70'}`}>{c.name}</button>
                      )
                    })}
                    {!careerItems.length && <span className="text-xs text-muted-foreground">No hay carreras</span>}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Button disabled={creating==='student'} onClick={handleCreateStudent} className="h-8">{creating==='student'? 'Creando...' : 'Guardar Alumno'}</Button>
                  {createError && creating==='student' && <span className="text-xs text-red-600">{createError}</span>}
                </div>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 p-4">
            <h4 className="font-semibold">Resumen</h4>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between gap-4"><span className="font-medium">Título</span><span
                className="text-right max-w-[60%] break-words">{draft.title || '—'}</span></div>
              <div className="flex justify-between gap-4"><span
                className="font-medium">Tipo</span><span>{draft.type || '—'}</span></div>
              <div className="flex justify-between gap-4"><span
                className="font-medium">Subtipos</span><span>{draft.subtypes.join(', ') || '—'}</span></div>
              <div className="flex justify-between gap-4"><span
                className="font-medium">Dominio</span><span>{draft.applicationDomain?.name || '—'}</span></div>
              <div className="flex justify-between gap-4"><span className="font-medium">Fecha presentación</span><span>{draft.initialSubmission || '—'}</span></div>
              <div className="flex justify-between gap-4"><span className="font-medium">Directores</span><span
                className="text-right max-w-[60%] break-words">{draft.directors.map(p => [p.lastname, p.name].filter(Boolean).join(', ')).join(' • ') || '—'}</span>
              </div>
              <div className="flex justify-between gap-4"><span className="font-medium">Co-directores</span><span
                className="text-right max-w-[60%] break-words">{draft.codirectors.map(p => [p.lastname, p.name].filter(Boolean).join(', ')).join(' • ') || '—'}</span>
              </div>
              <div className="flex justify-between gap-4"><span className="font-medium">Colaboradores</span><span
                className="text-right max-w-[60%] break-words">{draft.collaborators.map(p => [p.lastname, p.name].filter(Boolean).join(', ')).join(' • ') || '—'}</span>
              </div>
              <div className="flex justify-between gap-4"><span className="font-medium">Alumnos</span><span className="text-right max-w-[60%] break-words">{draft.students.map(s => [s.lastname, s.name].filter(Boolean).join(', ')).join(' • ') || '—'}</span></div>
            </div>
          </div>
        );
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">Nuevo Proyecto</Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle>Crear nuevo proyecto</SheetTitle>
        </SheetHeader>
        {error && <div className="text-sm text-red-600 px-4 py-2 rounded-md bg-red-100 border">{error}</div>}
        <div className="space-y-4">
          {renderStep()}
        </div>
        <SheetFooter>
          <div className="flex justify-end gap-2">
            {step > 0 && <Button variant="outline" onClick={() => setStep(s => s - 1)}>Anterior</Button>}
            {step < 3 && <Button disabled={!canNext()} onClick={() => setStep(s => s + 1)}>Siguiente</Button>}
            {step === 3 && <Button onClick={submit} isLoading={saving} loadingText="Creando...">Crear proyecto</Button>}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

