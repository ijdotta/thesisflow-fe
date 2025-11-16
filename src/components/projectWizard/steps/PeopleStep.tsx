import type { ProjectDraft, PersonBase } from '../types';
import { useAllProfessors } from '@/hooks/useAllProfessors';
import { useAllPeople } from '@/hooks/useAllPeople';
import { SearchableMultiSelect } from '../components/SearchableMultiSelect';

interface Props {
  draft: ProjectDraft;
  onPatch: (patch: Partial<ProjectDraft>) => void;
}

type PersonListKey = 'directors' | 'codirectors' | 'collaborators';

export function PeopleStep({ draft, onPatch }: Props) {
  const { data: professorsData } = useAllProfessors();
  const { data: peopleData } = useAllPeople();
  const professors = professorsData?.items ?? [];
  const people = peopleData?.items ?? [];

  function addTo(key: PersonListKey, item: PersonBase) {
    const normalized: PersonBase = {
      publicId: item.publicId,
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
        <SearchableMultiSelect
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
          placeholder="Seleccionar director"
        />
      </div>

      {/* Co-directors */}
      <div className="space-y-2">
        <h4 className="font-medium">Co-directores</h4>
        <SearchableMultiSelect
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
          placeholder="Seleccionar co-director"
        />
      </div>

      {/* Collaborators */}
      <div className="space-y-2">
        <h4 className="font-medium">Colaboradores</h4>
        <SearchableMultiSelect
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
          placeholder="Seleccionar colaborador"
        />
      </div>
    </div>
  );
}
