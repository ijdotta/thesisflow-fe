import { createPerson } from '@/api/people';
import { createProfessor } from '@/api/professors';
import { createStudent } from '@/api/students';
import { createProject, setProjectApplicationDomain, setProjectParticipants } from '@/api/projects';
import type { ProjectDraft, PersonBase, StudentDraft } from './types';

export function isTemp(publicId?: string) { return !publicId || publicId.startsWith('manual-'); }
export function requirePublicId(obj: { publicId?: string; id?: string }): string { const pid = obj.publicId || obj.id; if(!pid) throw new Error('Missing publicId'); return pid; }

export async function persistDirector(d: PersonBase): Promise<PersonBase> {
  if (!isTemp(d.publicId)) return d; // already persisted
  const person = await createPerson({ name: d.name, lastname: d.lastname });
  const personId = requirePublicId(person);
  try { if (d.email) await createProfessor({ personPublicId: personId, email: d.email }); } catch {/* ignore */}
  return { ...d, publicId: personId };
}
export async function persistCollaborator(c: PersonBase): Promise<PersonBase> {
  if (!isTemp(c.publicId)) return c;
  const person = await createPerson({ name: c.name, lastname: c.lastname });
  const personId = requirePublicId(person);
  return { ...c, publicId: personId };
}
export async function persistStudent(s: StudentDraft): Promise<StudentDraft> {
  if (!isTemp(s.publicId)) return s;
  const person = await createPerson({ name: s.name, lastname: s.lastname });
  const personId = requirePublicId(person);
  const student = await createStudent({ personPublicId: personId, studentId: s.studentId, email: s.email });
  const studentId = requirePublicId(student);
  return { ...s, publicId: studentId };
}

export async function persistAllManualEntities(draft: ProjectDraft) {
  const students = await Promise.all(draft.students.map(persistStudent));
  const directors = await Promise.all(draft.directors.map(persistDirector));
  const codirectors = await Promise.all(draft.codirectors.map(persistDirector));
  const collaborators = await Promise.all(draft.collaborators.map(persistCollaborator));
  return { ...draft, students, directors, codirectors, collaborators };
}

export type ParticipantRole = 'STUDENT' | 'DIRECTOR' | 'CO_DIRECTOR' | 'COLLABORATOR';

export function buildParticipants(draft: ProjectDraft): { personId: string; role: ParticipantRole }[] {
  const map = new Map<string, { personId: string; role: ParticipantRole }>();
  function add(personId?: string, role?: ParticipantRole) {
    if (!personId || !role) return;
    const key = personId + role;
    if (!map.has(key)) map.set(key, { personId, role });
  }
  draft.directors.forEach(d => add(d.publicId, 'DIRECTOR'));
  draft.codirectors.forEach(d => add(d.publicId, 'CO_DIRECTOR'));
  draft.collaborators.forEach(c => add(c.publicId, 'COLLABORATOR'));
  draft.students.forEach(s => add(s.publicId, 'STUDENT'));
  return Array.from(map.values());
}

export async function submitProject(draft: ProjectDraft) {
  // Create base project first
  const project = await createProject({
    title: draft.title,
    type: draft.type,
    subtypes: draft.subtypes,
    initialSubmission: draft.initialSubmission || undefined,
  });
  if (draft.applicationDomain?.publicId) {
    await setProjectApplicationDomain(project.publicId, draft.applicationDomain.publicId);
  }
  const participants = buildParticipants(draft);
  if (participants.length) {
    await setProjectParticipants(project.publicId, participants);
  }
  return project;
}
