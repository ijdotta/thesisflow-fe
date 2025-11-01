import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { PersonPills } from '../PersonPills';
import type { ProjectDraft, PersonBase } from '../types';
import { createPerson } from '@/api/people';
import { createProfessor } from '@/api/professors';
import { useAllProfessors } from '@/hooks/useAllProfessors';
import { useAllPeople } from '@/hooks/useAllPeople';
import { DropdownMultiSelect } from '../components/DropdownMultiSelect';
import { PersonSelector } from '../components/PersonSelector';

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
  const queryClient = useQueryClient();
  const { data: professorsData } = useAllProfessors();
  const { data: peopleData } = useAllPeople();
  const professors = professorsData?.items ?? [];
  const people = peopleData?.items ?? [];

  const [showNewDirector, setShowNewDirector] = useState(false);
  const [showNewCoDirector, setShowNewCoDirector] = useState(false);
  const [showNewCollaborator, setShowNewCollaborator] = useState(false);
  const [creating, setCreating] = useState<PersonListKey | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  function addTo(key: PersonListKey, item: PersonBase) {
    const normalized: PersonBase = {
      publicId: item.publicId || `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: item.name,
      lastname: item.lastname,
      email: item.email || ''
    };
    const next = [...draft[key], normalized];
    onPatch({ [key]: next } as Pick<ProjectDraft, typeof key>);
  }

  function removeFrom(key: PersonListKey, index: number) {
    const next = draft[key].filter((_, i) => i !== index);
    onPatch({ [key]: next } as Pick<ProjectDraft, typeof key>);
  }

  async function handleCreatePerson(target: PersonListKey, person: PersonBase) {
    try {
      setCreateError(null);
      setCreating(target);

      // Check if person is already persisted
      if (!person.publicId?.startsWith('manual-')) {
        // Already persisted person, just add it
        addTo(target, person);
      } else {
        // New manual person, need to create it
        const created = await createPerson({ name: person.name, lastname: person.lastname });
        const personId = ensureId(created);

        // If director/co-director, create professor profile
        if ((target === 'directors' || target === 'codirectors') && person.email) {
          try {
            await createProfessor({ personPublicId: personId, email: person.email });
          } catch {
            /* ignore professor creation error */
          }
        }

        addTo(target, { publicId: personId, name: created.name, lastname: created.lastname, email: person.email });
        
        // Invalidate professors query to refetch with new person
        if (target === 'directors' || target === 'codirectors') {
          await queryClient.invalidateQueries({ queryKey: ['all-professors'] });
        } else if (target === 'collaborators') {
          await queryClient.invalidateQueries({ queryKey: ['all-people'] });
        }
      }

      // Reset UI state
      if (target === 'directors') setShowNewDirector(false);
      else if (target === 'codirectors') setShowNewCoDirector(false);
      else setShowNewCollaborator(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setCreateError(msg || 'Error creando persona');
    } finally {
      setCreating(null);
    }
  }

  const professorItems = professors.map(p => ({
    publicId: p.publicId,
    name: p.name,
    display: p.display
  }));

  const peopleItems = people.map(p => ({
    publicId: p.publicId,
    name: p.name,
    display: p.display
  }));

  const directorIds = draft.directors.map(d => d.publicId);
  const codirectorIds = draft.codirectors.map(d => d.publicId);
  const collaboratorIds = draft.collaborators.map(c => c.publicId);

  return (
    <div className="space-y-8 p-4">
      {/* Directors */}
      <div className="space-y-2">
        <h4 className="font-medium">Directores *</h4>
        <DropdownMultiSelect
          items={professorItems}
          selectedIds={directorIds}
          onSelect={(id) => {
            const p = professors.find(x => x.publicId === id);
            if (p) addTo('directors', { publicId: p.publicId, name: p.name, lastname: p.lastname, email: p.email || '' });
          }}
          onRemove={(id) => {
            const idx = draft.directors.findIndex(d => d.publicId === id);
            if (idx >= 0) removeFrom('directors', idx);
          }}
          onAddNew={() => setShowNewDirector(true)}
          placeholder="Seleccionar director"
        />
        {showNewDirector && (
          <>
            <PersonSelector
              title="Nuevo Director"
              onPersonSelected={(person) => handleCreatePerson('directors', person)}
              onCancel={() => setShowNewDirector(false)}
              showEmail={true}
            />
            {createError && <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{createError}</div>}
          </>
        )}
      </div>

      {/* Co-directors */}
      <div className="space-y-2">
        <h4 className="font-medium">Co-directores</h4>
        <DropdownMultiSelect
          items={professorItems}
          selectedIds={codirectorIds}
          onSelect={(id) => {
            const p = professors.find(x => x.publicId === id);
            if (p) addTo('codirectors', { publicId: p.publicId, name: p.name, lastname: p.lastname, email: p.email || '' });
          }}
          onRemove={(id) => {
            const idx = draft.codirectors.findIndex(d => d.publicId === id);
            if (idx >= 0) removeFrom('codirectors', idx);
          }}
          onAddNew={() => setShowNewCoDirector(true)}
          placeholder="Seleccionar co-director"
        />
        {showNewCoDirector && (
          <>
            <PersonSelector
              title="Nuevo Co-director"
              onPersonSelected={(person) => handleCreatePerson('codirectors', person)}
              onCancel={() => setShowNewCoDirector(false)}
              showEmail={true}
            />
            {createError && <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{createError}</div>}
          </>
        )}
      </div>

      {/* Collaborators */}
      <div className="space-y-2">
        <h4 className="font-medium">Colaboradores</h4>
        {collaboratorIds.length === 0 ? (
          <button
            type="button"
            onClick={() => setShowNewCollaborator(true)}
            className="text-sm text-primary hover:underline"
          >
            + Agregar colaborador
          </button>
        ) : (
          <>
            <DropdownMultiSelect
              items={peopleItems}
              selectedIds={collaboratorIds}
              onSelect={(id) => {
                const p = people.find(x => x.publicId === id);
                if (p) addTo('collaborators', { publicId: p.publicId, name: p.name, lastname: p.lastname, email: p.email || '' });
              }}
              onRemove={(id) => {
                const idx = draft.collaborators.findIndex(c => c.publicId === id);
                if (idx >= 0) removeFrom('collaborators', idx);
              }}
              onAddNew={() => setShowNewCollaborator(true)}
              placeholder="Seleccionar colaborador"
            />
            <button
              type="button"
              onClick={() => setShowNewCollaborator(true)}
              className="text-sm text-primary hover:underline"
            >
              + Agregar otro colaborador
            </button>
          </>
        )}
        {showNewCollaborator && (
          <>
            <PersonSelector
              title="Nuevo Colaborador"
              onPersonSelected={(person) => handleCreatePerson('collaborators', person)}
              onCancel={() => setShowNewCollaborator(false)}
              showEmail={false}
            />
            {createError && <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{createError}</div>}
          </>
        )}
      </div>
    </div>
  );
}
