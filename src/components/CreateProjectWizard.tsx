import * as React from 'react';
import {Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter} from '@/components/ui/sheet';
import {Button} from '@/components/ui/button';

// New modular imports
import { emptyDraft, type ProjectDraft } from '@/components/projectWizard/types';
import { BasicInfoStep } from '@/components/projectWizard/steps/BasicInfoStep';
import { PeopleStep } from '@/components/projectWizard/steps/PeopleStep';
import { StudentsStep } from '@/components/projectWizard/steps/StudentsStep';
import { SummaryStep } from '@/components/projectWizard/steps/SummaryStep';
import { persistAllManualEntities, submitProject } from '@/components/projectWizard/actions';

export default function CreateProjectWizard({onCreated}: { onCreated?: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<ProjectDraft>({...emptyDraft});

  function patchDraft(patch: Partial<ProjectDraft>) { setDraft(d => ({ ...d, ...patch })); }
  function reset() { setDraft({...emptyDraft}); setStep(0); setError(null); }

  // Validation per step (same rules as original)
  const canNext = React.useCallback(() => {
    if (step === 0) return !!draft.title && !!draft.type && !!draft.career;
    if (step === 1) return draft.directors.length > 0;
    if (step === 2) return draft.students.length > 0;
    return true;
  }, [draft, step]);

  async function handleSubmit() {
    setSaving(true); setError(null);
    try {
      // Persist any local/manual entities first
      const persisted = await persistAllManualEntities(draft);
      setDraft(persisted); // keep local state consistent
      // Submit project & participants
      await submitProject(persisted);
      onCreated?.();
      setOpen(false);
      reset();
    } catch (e:any) {
      setError(e?.message || 'Error creando proyecto');
      // Close wizard after showing error briefly
      setTimeout(() => {
        setOpen(false);
        reset();
      }, 2000);
    } finally {
      setSaving(false);
    }
  }

  function renderStep() {
    switch (step) {
      case 0: return <BasicInfoStep draft={draft} onPatch={patchDraft} />;
      case 1: return <PeopleStep draft={draft} onPatch={patchDraft} />;
      case 2: return <StudentsStep draft={draft} onPatch={patchDraft} />;
      case 3: return <SummaryStep draft={draft} />;
      default: return null;
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
        <div className="space-y-4">{renderStep()}</div>
        <SheetFooter>
          <div className="flex justify-end gap-2">
            {step > 0 && <Button variant="outline" onClick={() => setStep(s => s - 1)}>Anterior</Button>}
            {step < 3 && <Button disabled={!canNext()} onClick={() => setStep(s => s + 1)}>Siguiente</Button>}
            {step === 3 && <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Creando...' : 'Crear proyecto'}</Button>}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
