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
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Gestionar Recursos</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
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
