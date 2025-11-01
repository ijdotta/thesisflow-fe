import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ProjectDraft, StudentDraft } from '../types';
import { useAllStudents } from '@/hooks/useAllStudents';
import { createPerson } from '@/api/people';
import { createStudent, setStudentCareers } from '@/api/students';
import { useCareers } from '@/hooks/useCareers';
import { DropdownMultiSelect } from '../components/DropdownMultiSelect';
import { PersonSelector } from '../components/PersonSelector';

interface Props {
  draft: ProjectDraft;
  onPatch: (patch: Partial<ProjectDraft>) => void;
}

function ensureId(p: { publicId?: string; id?: string }): string {
  const id = p.publicId || p.id;
  if (!id) throw new Error('Entidad sin ID');
  return id;
}

export function StudentsStep({ draft, onPatch }: Props) {
  const { data: studentsData } = useAllStudents();
  const { data: careersData } = useCareers();
  const students = studentsData?.items ?? [];
  const careers = careersData?.items || [];

  const [showNewStudent, setShowNewStudent] = useState(false);
  const [newStudentPerson, setNewStudentPerson] = useState<{ name: string; lastname: string; email: string; publicId?: string } | null>(null);
  const [newStudentData, setNewStudentData] = useState({ studentId: '', careers: [] as string[] });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  function patchStudents(mutator: (prev: StudentDraft[]) => StudentDraft[]) {
    onPatch({ students: mutator(draft.students) });
  }

  function addStudent(item: Partial<StudentDraft>) {
    const normalized: StudentDraft = {
      publicId: item.publicId || `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: item.name || '',
      lastname: item.lastname || '',
      email: item.email || '',
      studentId: item.studentId,
      careers: item.careers || [],
    };
    patchStudents(prev => [...prev, normalized]);
  }

  function updateStudent(index: number, patch: Partial<StudentDraft>) {
    patchStudents(prev => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function removeStudent(index: number) {
    patchStudents(prev => prev.filter((_, i) => i !== index));
  }

  function toggleCareerForStudent(index: number, careerPublicId: string) {
    const student = draft.students[index];
    const currentCareers = student.careers || [];
    const updatedCareers = currentCareers.includes(careerPublicId)
      ? currentCareers.filter(c => c !== careerPublicId)
      : [...currentCareers, careerPublicId];
    updateStudent(index, { careers: updatedCareers });
  }

  function toggleCareerForNew(careerPublicId: string) {
    setNewStudentData(prev => ({
      ...prev,
      careers: prev.careers.includes(careerPublicId)
        ? prev.careers.filter(c => c !== careerPublicId)
        : [...prev.careers, careerPublicId]
    }));
  }

  async function handleCreateStudent() {
    try {
      setCreateError(null);
      setCreating(true);

      if (!newStudentPerson) {
        setCreateError('Selecciona o crea una persona');
        return;
      }

      if (!newStudentData.studentId) {
        setCreateError('Legajo requerido');
        return;
      }

      let personId = newStudentPerson.publicId;

      // If person is not persisted yet, create it
      if (!personId || personId.startsWith('manual-')) {
        const created = await createPerson({ name: newStudentPerson.name, lastname: newStudentPerson.lastname });
        personId = ensureId(created);
      }

      const student = await createStudent({
        personPublicId: personId,
        studentId: newStudentData.studentId || undefined,
        email: newStudentPerson.email || undefined
      });
      const sid = ensureId(student);

      if (newStudentData.careers.length > 0) {
        await setStudentCareers(sid, newStudentData.careers);
      }

      addStudent({
        publicId: sid,
        name: newStudentPerson.name,
        lastname: newStudentPerson.lastname,
        studentId: newStudentData.studentId,
        email: newStudentPerson.email,
        careers: newStudentData.careers
      });

      setNewStudentPerson(null);
      setNewStudentData({ studentId: '', careers: [] });
      setShowNewStudent(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setCreateError(msg || 'Error creando alumno');
    } finally {
      setCreating(false);
    }
  }

  const studentItems = students.map(s => ({
    publicId: s.publicId,
    name: s.name,
    display: s.display
  }));

  const studentIds = draft.students.map(s => s.publicId);

  return (
    <div className="space-y-6 p-4">
      <h4 className="font-medium">Alumnos *</h4>

      {studentIds.length === 0 ? (
        <button
          type="button"
          onClick={() => setShowNewStudent(true)}
          className="text-sm text-primary hover:underline"
        >
          + Agregar alumno
        </button>
      ) : (
        <>
          <DropdownMultiSelect
            items={studentItems}
            selectedIds={studentIds}
            onSelect={(id) => {
              const s = students.find(x => x.publicId === id);
              if (s)
                addStudent({
                  publicId: s.publicId,
                  name: s.name,
                  lastname: s.lastname,
                  studentId: s.studentId,
                  email: s.email,
                  careers: s.careers
                });
            }}
            onRemove={(id) => {
              const idx = draft.students.findIndex(s => s.publicId === id);
              if (idx >= 0) removeStudent(idx);
            }}
            onAddNew={() => setShowNewStudent(true)}
            placeholder="Seleccionar alumno"
          />
          <button
            type="button"
            onClick={() => setShowNewStudent(true)}
            className="text-sm text-primary hover:underline"
          >
            + Agregar otro alumno
          </button>
        </>
      )}

      {showNewStudent && (
        <div className="border rounded-md p-4 space-y-4 bg-muted/30">
          {!newStudentPerson ? (
            <PersonSelector
              title="Seleccionar o crear persona para alumno"
              onPersonSelected={(person) =>
                setNewStudentPerson({
                  name: person.name,
                  lastname: person.lastname,
                  email: person.email || '',
                  publicId: person.publicId
                })
              }
              onCancel={() => setShowNewStudent(false)}
              showEmail={true}
            />
          ) : (
            <>
              <div className="text-sm bg-accent p-2 rounded">
                <strong>Persona:</strong> {newStudentPerson.lastname}, {newStudentPerson.name}
                <button
                  type="button"
                  onClick={() => setNewStudentPerson(null)}
                  className="ml-3 text-primary hover:underline text-xs"
                >
                  Cambiar
                </button>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Legajo *</label>
                <Input
                  placeholder="Legajo"
                  value={newStudentData.studentId}
                  onChange={(e) =>
                    setNewStudentData(d => ({ ...d, studentId: e.target.value }))
                  }
                  className="h-8"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Carreras</label>
                <div className="flex flex-wrap gap-2">
                  {careers.map(career => {
                    const isSelected = newStudentData.careers.includes(career.publicId);
                    return (
                      <button
                        key={career.publicId}
                        type="button"
                        onClick={() => toggleCareerForNew(career.publicId)}
                        className={`px-2 py-1 rounded border text-xs transition-colors ${
                          isSelected ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted hover:bg-muted/70'
                        }`}
                      >
                        {career.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleCreateStudent}
                  disabled={creating}
                  className="h-8"
                >
                  {creating ? 'Creando...' : 'Guardar Alumno'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowNewStudent(false);
                    setNewStudentPerson(null);
                    setNewStudentData({ studentId: '', careers: [] });
                  }}
                  className="h-8"
                >
                  Cancelar
                </Button>
              </div>
              {createError && <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{createError}</div>}
            </>
          )}
        </div>
      )}

      <div className="space-y-3">
        {draft.students.map((s, i) => (
          <div key={s.publicId || i} className="border rounded-md p-3 space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Input
                className="h-8 flex-1 min-w-[140px]"
                placeholder="Nombre *"
                value={s.name}
                onChange={(e) => updateStudent(i, { name: e.target.value })}
              />
              <Input
                className="h-8 flex-1 min-w-[140px]"
                placeholder="Apellido *"
                value={s.lastname}
                onChange={(e) => updateStudent(i, { lastname: e.target.value })}
              />
              <Input className="h-8 w-40" placeholder="Legajo" value={s.studentId || ''} onChange={(e) => updateStudent(i, { studentId: e.target.value })} />
              <Button variant="ghost" size="sm" onClick={() => removeStudent(i)} className="h-8">
                Quitar
              </Button>
            </div>
            <div className="space-y-2">
              <Input className="h-8" placeholder="Email" value={s.email} onChange={(e) => updateStudent(i, { email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Carreras del alumno</label>
              <div className="flex flex-wrap gap-2">
                {careers.map(career => {
                  const isSelected = (s.careers || []).includes(career.publicId);
                  return (
                    <button
                      key={career.publicId}
                      type="button"
                      onClick={() => toggleCareerForStudent(i, career.publicId)}
                      className={`px-2 py-1 rounded border text-xs transition-colors ${
                        isSelected ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted hover:bg-muted/70'
                      }`}
                    >
                      {career.name}
                    </button>
                  );
                })}
              </div>
              {(s.careers || []).length === 0 && <span className="text-xs text-muted-foreground">Sin carreras asignadas</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
