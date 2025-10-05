import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { slugify } from '@/lib/utils';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (o:boolean)=>void;
  entityName: string; // human readable current name (used to compute slug)
  label: string; // label for entity e.g. 'persona' / 'proyecto'
  onConfirm: () => Promise<void> | void;
}

export function ConfirmDeleteDialog({ open, onOpenChange, entityName, label, onConfirm }: ConfirmDeleteDialogProps) {
  const expectedSlug = React.useMemo(()=> slugify(entityName), [entityName]);
  const [value, setValue] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const canDelete = value === expectedSlug && !loading;

  async function handleConfirm() {
    if (!canDelete) return;
    try { setLoading(true); await onConfirm(); } finally { setLoading(false); }
  }

  React.useEffect(()=> { if (!open) { setValue(''); setLoading(false); } }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content className="fixed top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(520px,92vw)] rounded-md border bg-background p-6 shadow-lg space-y-5 data-[state=open]:animate-in data-[state=closed]:animate-out">
          <div className="space-y-1.5">
            <Dialog.Title className="text-base font-semibold">Eliminar {label}</Dialog.Title>
            <Dialog.Description className="text-xs text-muted-foreground leading-relaxed">
              Esta acción es irreversible. Para confirmar escribe el identificador <code className="px-1 py-0.5 rounded bg-muted text-[11px]">{expectedSlug}</code>.
            </Dialog.Description>
          </div>
          <div className="space-y-2">
            <input
              autoFocus
              className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={expectedSlug}
              value={value}
              onChange={e=> setValue(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={()=> onOpenChange(false)} disabled={loading}>Cancelar</Button>
            <Button type="button" variant="destructive" size="sm" disabled={!canDelete} onClick={handleConfirm}>{loading ? 'Eliminando…' : 'Eliminar'}</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

