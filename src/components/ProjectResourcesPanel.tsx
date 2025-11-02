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
  const [isEditing, setIsEditing] = React.useState(false);
  const [items, setItems] = React.useState<ProjectResourceRequest[]>(resources);
  const [isSaving, setIsSaving] = React.useState(false);
  const { push } = useOptionalToast();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    setItems(resources);
  }, [resources]);

  function addResource() {
    setItems([...items, { url: '', title: '', description: '' }]);
  }

  function updateResource(index: number, field: keyof ProjectResourceRequest, value: string) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  }

  function removeResource(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function cancel() {
    setItems(resources);
    setIsEditing(false);
  }

  async function save() {
    // Validate
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.url || !item.title) {
        push({ variant: 'error', title: 'Error', message: `Recurso ${i + 1}: URL y Título son requeridos` });
        return;
      }
      if (!isValidUrl(item.url)) {
        push({ variant: 'error', title: 'Error', message: `Recurso ${i + 1}: URL inválida` });
        return;
      }
      if (item.title.length > 255) {
        push({ variant: 'error', title: 'Error', message: `Recurso ${i + 1}: Título muy largo (máx 255 caracteres)` });
        return;
      }
      if (item.description && item.description.length > 1000) {
        push({ variant: 'error', title: 'Error', message: `Recurso ${i + 1}: Descripción muy larga (máx 1000 caracteres)` });
        return;
      }
    }

    setIsSaving(true);
    try {
      await updateProjectResources(projectId, items);
      // Invalidate project query
      await queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      setIsEditing(false);
      push({ variant: 'success', title: 'Éxito', message: 'Recursos actualizados' });
    } catch (error) {
      push({ variant: 'error', title: 'Error', message: (error as Error).message });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight">Recursos</h3>
        {canEdit && (
          <Button 
            size="sm" 
            variant={isEditing ? "default" : "outline"} 
            onClick={() => setIsEditing(!isEditing)}
          >
            <Plus className="h-4 w-4 mr-1" /> 
            {isEditing ? 'Listo' : 'Editar'}
          </Button>
        )}
      </div>

      {!isEditing ? (
        // View mode
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-xs text-muted-foreground py-4 px-3 bg-muted/30 rounded border border-dashed">
              Sin recursos
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((resource, idx) => (
                <div
                  key={idx}
                  className="border rounded-md p-3 space-y-2 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm font-medium text-primary hover:underline break-words"
                      >
                        {resource.title}
                        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                      </a>
                      <p className="text-xs text-muted-foreground mt-1 break-all">{resource.url}</p>
                    </div>
                  </div>
                  {resource.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{resource.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Edit mode
        <div className="space-y-4 border rounded-md p-4 bg-muted/30">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addResource}
            className="w-full"
            disabled={isSaving}
          >
            <Plus className="h-4 w-4 mr-1" /> Agregar recurso
          </Button>

          <div className="space-y-3">
            {items.length === 0 && (
              <div className="text-xs text-muted-foreground text-center py-4">Sin recursos. Agrega uno arriba.</div>
            )}
            {items.map((resource, idx) => (
              <div key={idx} className="space-y-3 border rounded p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground">Recurso {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeResource(idx)}
                    className="text-destructive hover:text-destructive/70"
                    title="Eliminar recurso"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <label className="text-xs font-medium">URL *</label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={resource.url}
                    onChange={(e) => updateResource(idx, 'url', e.target.value)}
                    className="mt-1 h-8"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium">Título *</label>
                    <span className="text-xs text-muted-foreground">
                      {resource.title.length}/255
                    </span>
                  </div>
                  <Input
                    placeholder="Nombre del archivo"
                    value={resource.title}
                    onChange={(e) => updateResource(idx, 'title', e.target.value.slice(0, 255))}
                    maxLength={255}
                    className="mt-1 h-8"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium">Descripción</label>
                    <span className="text-xs text-muted-foreground">
                      {(resource.description?.length || 0)}/1000
                    </span>
                  </div>
                  <textarea
                    placeholder="Detalles sobre el recurso (opcional)"
                    value={resource.description || ''}
                    onChange={(e) => updateResource(idx, 'description', e.target.value.slice(0, 1000))}
                    maxLength={1000}
                    className="mt-1 w-full px-3 py-2 border rounded text-xs resize-none"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={cancel}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={save}
              disabled={isSaving}
            >
              {isSaving && <Loader className="h-4 w-4 mr-1 animate-spin" />}
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}
