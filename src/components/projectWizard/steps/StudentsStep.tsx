import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ProjectDraft, StudentDraft } from '../types';
import { useSearchStudents } from '@/hooks/useSearchStudents';
import { parsePersonInput } from '../parsePerson';
import { createPerson } from '@/api/people';
import { createStudent } from '@/api/students';

interface Props {
  draft: ProjectDraft;
  onPatch: (patch: Partial<ProjectDraft>) => void;
}

function ensureId(p: { publicId?: string; id?: string }): string { const id = p.publicId || p.id; if(!id) throw new Error('Entidad sin ID'); return id; }

export function StudentsStep({ draft, onPatch }: Props) {
  const [studentQuery, setStudentQuery] = useState('');
  const { data: studentResults } = useSearchStudents(studentQuery);
  const studentItems = studentResults?.items ?? [];

  // Inline creation (careers removed per requirement)
  const [showNewStudent, setShowNewStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', lastname: '', studentId: '', email: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  function patchStudents(mutator: (prev: StudentDraft[]) => StudentDraft[]) { onPatch({ students: mutator(draft.students) }); }
  function addStudent(item: Partial<StudentDraft>) {
    const normalized: StudentDraft = {
      publicId: item.publicId || `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: item.name || '',
      lastname: item.lastname || '',
      email: item.email,
      studentId: item.studentId,
    };
    patchStudents(prev => [...prev, normalized]);
  }
  function updateStudent(index: number, patch: Partial<StudentDraft>) { patchStudents(prev => prev.map((s,i)=> i===index ? { ...s, ...patch } : s)); }
  function removeStudent(index: number) { patchStudents(prev => prev.filter((_,i)=> i!==index)); }
  function addManual(raw: string) { const parsed = parsePersonInput(raw); if (!parsed) return; addStudent(parsed); }

  async function handleCreateStudent() {
    try {
      setCreateError(null); setCreating(true);
      if (!newStudent.name || !newStudent.lastname) { setCreateError('Nombre y apellido requeridos'); return; }
      if (!newStudent.studentId) { setCreateError('Legajo requerido'); return; }
      const person = await createPerson({ name: newStudent.name, lastname: newStudent.lastname });
      const personId = ensureId(person);
      const student = await createStudent({ personPublicId: personId, studentId: newStudent.studentId || undefined, email: newStudent.email || undefined });
      const sid = ensureId(student);
      addStudent({ publicId: sid, name: person.name, lastname: person.lastname, studentId: newStudent.studentId });
      setNewStudent({ name:'', lastname:'', studentId:'', email:'' });
      setShowNewStudent(false);
    } catch (e) { const msg = e instanceof Error ? e.message : String(e); setCreateError(msg || 'Error creando alumno'); } finally { setCreating(false); }
  }

  return (
    <div className="space-y-6 p-4">
      <h4 className="font-medium">Alumnos *</h4>
      <div className="flex gap-2 mb-2">
        <Input value={studentQuery} onChange={e => setStudentQuery(e.target.value)} placeholder="Apellido, Nombre o búsqueda" />
        <Button type="button" variant="outline" disabled={!studentQuery.trim()} onClick={() => { addManual(studentQuery); setStudentQuery(''); }}>Añadir manual</Button>
      </div>
      {!!studentItems.length && (
        <div className="border rounded-md max-h-40 overflow-auto divide-y text-sm mb-3">
          {studentItems.map(s => (
            <button key={s.publicId} onClick={() => { addStudent({ publicId: s.publicId, name: s.name, lastname: s.lastname, studentId: s.studentId }); setStudentQuery(''); }} className="w-full text-left px-2 py-1 hover:bg-accent">{s.display}</button>
          ))}
        </div>
      )}
      <div className="space-y-3">
        {draft.students.map((s, i) => (
          <div key={s.publicId || i} className="border rounded-md p-3 space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Input className="h-8 flex-1 min-w-[140px]" placeholder="Nombre" value={s.name} onChange={e => updateStudent(i, { name: e.target.value })} />
              <Input className="h-8 flex-1 min-w-[140px]" placeholder="Apellido" value={s.lastname} onChange={e => updateStudent(i, { lastname: e.target.value })} />
              <Input className="h-8 w-40" placeholder="Legajo" value={s.studentId || ''} onChange={e => updateStudent(i, { studentId: e.target.value })} />
              <Button variant="ghost" size="sm" onClick={() => removeStudent(i)} className="h-8">Quitar</Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewStudent(s => !s)}>{showNewStudent? 'Cancelar':'Nuevo Alumno'}</Button>
      </div>
      {showNewStudent && (
        <div className="border rounded-md p-3 space-y-2 bg-muted/30 mb-4">
          <div className="flex flex-wrap gap-2">
            <Input placeholder="Nombre" value={newStudent.name} onChange={e=>setNewStudent(d=>({...d,name:e.target.value}))} className="h-8 w-40" />
            <Input placeholder="Apellido" value={newStudent.lastname} onChange={e=>setNewStudent(d=>({...d,lastname:e.target.value}))} className="h-8 w-40" />
            <Input placeholder="Legajo" value={newStudent.studentId} onChange={e=>setNewStudent(d=>({...d,studentId:e.target.value}))} className="h-8 w-32" />
            <Input placeholder="Email (opcional)" value={newStudent.email} onChange={e=>setNewStudent(d=>({...d,email:e.target.value}))} className="h-8 w-52" />
          </div>
          <div className="flex gap-2 items-center">
            <Button disabled={creating} onClick={handleCreateStudent} className="h-8">{creating? 'Creando...' : 'Guardar Alumno'}</Button>
            {createError && <span className="text-xs text-red-600">{createError}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
