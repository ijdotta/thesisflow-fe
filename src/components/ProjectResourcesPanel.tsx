import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useOptionalToast } from '@/components/ui/toast';
import { Trash2, Plus, ExternalLink, Loader } from 'lucide-react';
import type { ProjectResource, ProjectResourceRequest } from '@/types/ProjectResource';
import { updateProjectResources } from '@/api/projectResources';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  projectId: string;
  resources?: ProjectResource[];
  canEdit?: boolean;
}

export function ProjectResourcesPanel({ projectId, resources = [], canEdit = false }: Props) {
  const [formItems, setFormItems] = React.useState<ProjectResourceRequest[]>(resources);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const { push } = useOptionalToast();
  const queryClient = useQueryClient();

  function addNewResource() {
    setFormItems([...formItems, { url: '', title: '', description: '' }]);
  }

  function removeResourceItem(index: number) {
    setFormItems(formItems.filter((_, i) => i !== index));
  }

  function updateResourceItem(index: number, field: keyof ProjectResourceRequest, value: string) {
    const updated = [...formItems];
    updated[index] = { ...updated[index], [field]: value };
    setFormItems(updated);
  }

  function handleCancel() {
    setFormItems(resources);
    setIsEditing(false);
  }

  function isValidUrl(url: string): boolean {
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  async function handleSave() {
    // Validate all items
    for (let i = 0; i < formItems.length; i++) {
      const item = formItems[i];
      
      if (!item.url.trim()) {
        push({ variant: 'error', title: 'Error', message: `Recurso ${i + 1}: URL es requerida` });
        return;
      }
      
      if (!isValidUrl(item.url)) {
        push({ variant: 'error', title: 'Error', message: `Recurso ${i + 1}: URL inválida (debe ser HTTP/HTTPS)` });
        return;
      }
      
      if (!item.title.trim()) {
        push({ variant: 'error', title: 'Error', message: `Recurso ${i + 1}: Título es requerido` });
        return;
      }
      
      if (item.title.length > 255) {
        push({ variant: 'error', title: 'Error', message: `Recurso ${i + 1}: Título muy largo (máx 255)` });
        return;
      }
      
      if (item.description && item.description.length > 1000) {
        push({ variant: 'error', title: 'Error', message: `Recurso ${i + 1}: Descripción muy larga (máx 1000)` });
        return;
      }
    }

    setIsSaving(true);
    try {
      await updateProjectResources(projectId, formItems);
      await queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      setIsEditing(false);
      push({ variant: 'success', title: 'Éxito', message: 'Recursos guardados' });
    } catch (error) {
      push({ variant: 'error', title: 'Error', message: (error as Error).message });
    } finally {
      setIsSaving(false);
    }
  }

  if (!isEditing) {
    // View mode
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold tracking-tight">Recursos</h3>
          {canEdit && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsEditing(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Editar
            </Button>
          )}
        </div>

        {formItems.length === 0 ? (
          <div className="text-xs text-muted-foreground py-3 px-3 bg-muted/30 rounded border border-dashed">
            Sin recursos
          </div>
        ) : (
          <div className="space-y-2">
            {formItems.map((resource, idx) => (
              <div key={idx} className="border rounded-md p-3 space-y-2 hover:bg-muted/30 transition-colors">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  {resource.title}
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                </a>
                <p className="text-xs text-muted-foreground break-all">{resource.url}</p>
                {resource.description && (
                  <p className="text-xs text-muted-foreground">{resource.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Edit mode
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight">Recursos</h3>
        <Button 
          size="sm" 
          variant="default" 
          onClick={() => setIsEditing(false)}
        >
          Listo
        </Button>
      </div>

      <div className="border rounded-md p-4 bg-muted/30 space-y-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addNewResource}
          className="w-full"
          disabled={isSaving}
        >
          <Plus className="h-4 w-4 mr-1" />
          Agregar Recurso
        </Button>

        {formItems.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-6">
            No hay recursos. Haz clic arriba para agregar uno.
          </div>
        ) : (
          <div className="space-y-3">
            {formItems.map((resource, idx) => (
              <div key={idx} className="bg-white border rounded-md p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Recurso {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeResourceItem(idx)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <label className="text-xs font-medium block mb-1">URL *</label>
                  <Input
                    type="url"
                    placeholder="https://ejemplo.com/archivo"
                    value={resource.url}
                    onChange={(e) => updateResourceItem(idx, 'url', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-medium">Título *</label>
                    <span className="text-xs text-muted-foreground">{resource.title.length}/255</span>
                  </div>
                  <Input
                    placeholder="Nombre del archivo"
                    value={resource.title}
                    onChange={(e) => updateResourceItem(idx, 'title', e.target.value.slice(0, 255))}
                    className="h-8 text-sm"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-medium">Descripción</label>
                    <span className="text-xs text-muted-foreground">{(resource.description?.length || 0)}/1000</span>
                  </div>
                  <textarea
                    placeholder="Descripción opcional"
                    value={resource.description || ''}
                    onChange={(e) => updateResourceItem(idx, 'description', e.target.value.slice(0, 1000))}
                    className="w-full h-16 p-2 border rounded text-sm resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={isSaving}
        >
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving && <Loader className="h-4 w-4 mr-1 animate-spin" />}
          {isSaving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </div>
  );
}
