import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface Toast { id: string; title?: string; message: string; variant?: 'default' | 'success' | 'error'; duration?: number }
interface ToastContextValue { toasts: Toast[]; push: (t: Omit<Toast,'id'>) => void; dismiss: (id: string) => void }

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => setToasts(ts => ts.filter(t => t.id !== id)), []);
  const push = useCallback((t: Omit<Toast,'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const toast: Toast = { id, duration: 4000, variant: 'default', ...t };
    setToasts(ts => [...ts, toast]);
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => dismiss(id), toast.duration);
    }
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toasts, push, dismiss }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
        {toasts.map(t => (
          <div key={t.id} className={`relative rounded-md border p-3 text-sm shadow bg-background ${t.variant==='success'? 'border-green-500' : t.variant==='error' ? 'border-red-500' : 'border-border'}`}>
            {t.title && <div className="font-medium mb-0.5">{t.title}</div>}
            <div>{t.message}</div>
            <button onClick={() => dismiss(t.id)} className="absolute top-1 right-1 text-xs text-muted-foreground hover:underline">cerrar</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

