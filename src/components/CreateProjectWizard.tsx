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

// --- Draft Types ---
interface PersonBase {
  publicId?: string; // local temp for manual entities
  name: string;
  lastname: string;
  email?: string;
}

interface StudentDraft extends PersonBase {
  studentId?: string;
  careers: string[]; // multi-career support
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
  const careerList = careerData?.items?.map(c => c.name) ?? [];

  function updateDraft<K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) {
    setDraft(d => ({...d, [key]: value}));
  }

  function addTo(key: 'directors' | 'codirectors' | 'collaborators' | 'students', item: any) {
    if (key === 'students') {
      const normalized = { publicId: item.publicId || `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`, careers: [], ...item };
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

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      // Build payload (adjust according to backend expectation)
      const payload = {
        title: draft.title,
        type: draft.type,
        subtypes: draft.subtypes,
        applicationDomainId: draft.applicationDomain?.publicId,
        initialSubmission: draft.initialSubmission,
        directors: draft.directors.map(p => p.publicId),
        codirectors: draft.codirectors.map(p => p.publicId),
        collaborators: draft.collaborators.map(p => p.publicId),
        students: draft.students.map(s => ({
          publicId: s.publicId,
          name: s.name,
          lastname: s.lastname,
          studentId: s.studentId,
          careers: s.careers
        }))
      };
      await api.post('/projects', payload);
      onCreated?.();
      setOpen(false);
      reset();
    } catch (e: any) {
      setError(e?.message || 'Error al crear el proyecto');
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
                            {c}
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
                          {careerList.filter(c => !s.careers.includes(c)).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
              <div className="flex justify-between gap-4"><span className="font-medium">Alumnos</span><span
                className="text-right max-w-[60%] break-words">{draft.students.map(s => [s.lastname, s.name].filter(Boolean).join(', ')).join(' • ') || '—'}</span>
              </div>
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
          </div>
        );
      default:
        return null;
    }
  }

  const steps = ['Datos', 'Equipo', 'Alumnos', 'Resumen'];

  return (
    <Sheet open={open} onOpenChange={(o) => {
      setOpen(o);
      if (!o) reset();
    }}>
      <SheetTrigger asChild>
        <Button variant="default">Crear Proyecto</Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Nuevo Proyecto ({steps[step]})</SheetTitle>
          <div className="flex gap-2 text-xs text-muted-foreground flex-wrap">
            {steps.map((s, i) => (
              <div key={s}
                   className={`px-2 py-1 rounded-md border ${i === step ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted'}`}>{i + 1}. {s}</div>
            ))}
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-auto">
          {renderStep()}
        </div>
        <SheetFooter>
          <div className="flex justify-between gap-2 w-full">
            <div className="flex gap-2">
              {step > 0 && <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)}>Atrás</Button>}
              <Button type="button" variant="ghost" disabled={saving} onClick={() => {
                reset();
                setOpen(false);
              }}>Cancelar</Button>
            </div>
            <div className="flex gap-2">
              {step < steps.length - 1 && (
                <Button type="button" disabled={!canNext()} onClick={() => setStep(s => s + 1)}>Siguiente</Button>
              )}
              {step === steps.length - 1 && (
                <Button type="button" onClick={submit} disabled={saving || !canNext()}>
                  {saving ? 'Guardando…' : 'Crear'}
                </Button>
              )}
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
