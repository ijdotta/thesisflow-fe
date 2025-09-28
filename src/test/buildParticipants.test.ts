import { describe, it, expect } from 'vitest';
import { buildParticipants } from '@/components/projectWizard/actions';
import type { ProjectDraft } from '@/components/projectWizard/types';

function makeDraft(partial: Partial<ProjectDraft>): ProjectDraft {
  return {
    title: '', type: '', subtypes: [], applicationDomain: null, initialSubmission: undefined,
    directors: [], codirectors: [], collaborators: [], students: [],
    ...partial,
  };
}

describe('buildParticipants', () => {
  it('returns empty array when no participants', () => {
    const result = buildParticipants(makeDraft({}));
    expect(result).toEqual([]);
  });
  it('deduplicates same person across roles', () => {
    const draft = makeDraft({
      directors: [{ publicId: 'p1', name:'A', lastname:'B' }],
      codirectors: [{ publicId: 'p1', name:'A', lastname:'B' }],
      students: [{ publicId: 'p1', name:'A', lastname:'B', studentId:'s1', careers: [] } as any],
    });
    const result = buildParticipants(draft);
    // Person appears in multiple roles so expect 3 entries with unique role combos
    expect(result.filter(r => r.personPublicId==='p1').map(r=>r.role).sort()).toEqual(['CO_DIRECTOR','DIRECTOR','STUDENT']);
  });
  it('handles multiple distinct participants', () => {
    const draft = makeDraft({
      directors: [{ publicId: 'd1', name:'D', lastname:'1' }],
      collaborators: [{ publicId: 'c1', name:'C', lastname:'1' }],
      students: [ { publicId: 's1', name:'S', lastname:'1', studentId: 'X', careers: [] } as any ],
    });
    const result = buildParticipants(draft);
    const roles = result.reduce<Record<string,string[]>>((acc,p)=>{acc[p.personPublicId]=(acc[p.personPublicId]||[]).concat(p.role);return acc;},{});
    expect(roles).toEqual({ d1:['DIRECTOR'], c1:['COLLABORATOR'], s1:['STUDENT'] });
  });
});

