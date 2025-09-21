import type {ReactNode} from "react";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex">
    <aside className="w-64 border-r p-4">
    <h2 className="font-bold mb-3">ThesisFlow</h2>
      <nav className="space-y-2">
  <a href="/projects" className="underline">Projects</a>
    </nav>
    </aside>
    <main className="flex-1 p-6">{children}</main>
    </div>
);
}