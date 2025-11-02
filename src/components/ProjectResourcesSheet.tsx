import * as React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { Project } from '@/types/Project';
import { ProjectResourcesPanel } from '@/components/ProjectResourcesPanel';

interface Props {
  project: Project | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function ProjectResourcesSheet({ project, open, onOpenChange }: Props) {
  if (!project) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto py-6 px-6">
        <SheetHeader className="mb-6">
          <SheetTitle>Gestionar Recursos</SheetTitle>
        </SheetHeader>
        <div className="space-y-4">
          <ProjectResourcesPanel
            projectId={project.publicId}
            resources={project.resources}
            canEdit={true}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
