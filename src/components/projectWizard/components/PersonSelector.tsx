import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAllPeople } from '@/hooks/useAllPeople';
import type { PersonBase } from '../types';

interface PersonSelectorProps {
  onPersonSelected: (person: PersonBase) => void;
  onCancel: () => void;
  title: string;
  showEmail?: boolean;
  showStudentId?: boolean;
}

export function PersonSelector({
  onPersonSelected,
  onCancel,
  title,
  showEmail = true,
  showStudentId = false,
}: PersonSelectorProps) {
  const { data: peopleData } = useAllPeople();
  const people = peopleData?.items ?? [];

  const [selectedPersonId, setSelectedPersonId] = React.useState<string>('');
  const [showManual, setShowManual] = React.useState(false);
  const [manualData, setManualData] = React.useState({ name: '', lastname: '', email: '', studentId: '' });
  const [creating, setCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function handleSelectPerson() {
    if (!selectedPersonId) {
      setError('Por favor selecciona una persona');
      return;
    }
    const person = people.find(p => p.publicId === selectedPersonId);
    if (!person) return;

    onPersonSelected({
      publicId: person.publicId,
      name: person.name,
      lastname: person.lastname,
      email: manualData.email || person.email || '',
    });
  }

  async function handleCreateManual() {
    setError(null);
    if (!manualData.name || !manualData.lastname) {
      setError('Nombre y apellido son requeridos');
      return;
    }
    if (showEmail && !manualData.email) {
      setError('Email es requerido');
      return;
    }

    setCreating(true);
    try {
      const person: PersonBase = {
        publicId: `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: manualData.name,
        lastname: manualData.lastname,
        email: manualData.email,
      };
      onPersonSelected(person);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error creando persona');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="border rounded-md p-4 space-y-3 bg-muted/30">
      <h4 className="font-medium text-sm">{title}</h4>

      {!showManual ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Buscar persona existente</label>
            <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar persona..." />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {people.map(p => (
                  <SelectItem key={p.publicId} value={p.publicId}>
                    {p.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {showEmail && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email (opcional)</label>
              <Input
                placeholder="email@example.com"
                value={manualData.email}
                onChange={e => setManualData(d => ({ ...d, email: e.target.value }))}
                className="h-8"
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleSelectPerson}
              disabled={!selectedPersonId || creating}
              className="h-8"
            >
              {creating ? 'Procesando...' : 'Usar esta persona'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowManual(true)}
              className="h-8"
            >
              Crear nueva
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="h-8"
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Nombre *</label>
              <Input
                placeholder="Nombre"
                value={manualData.name}
                onChange={e => setManualData(d => ({ ...d, name: e.target.value }))}
                className="h-8"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Apellido *</label>
              <Input
                placeholder="Apellido"
                value={manualData.lastname}
                onChange={e => setManualData(d => ({ ...d, lastname: e.target.value }))}
                className="h-8"
              />
            </div>
          </div>
          {showEmail && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email *</label>
              <Input
                placeholder="email@example.com"
                value={manualData.email}
                onChange={e => setManualData(d => ({ ...d, email: e.target.value }))}
                className="h-8"
              />
            </div>
          )}
          {showStudentId && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Legajo *</label>
              <Input
                placeholder="Legajo"
                value={manualData.studentId}
                onChange={e => setManualData(d => ({ ...d, studentId: e.target.value }))}
                className="h-8"
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleCreateManual}
              disabled={creating}
              className="h-8"
            >
              {creating ? 'Creando...' : 'Guardar'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowManual(false);
                setManualData({ name: '', lastname: '', email: '', studentId: '' });
              }}
              className="h-8"
            >
              Volver
            </Button>
          </div>
        </div>
      )}

      {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</div>}
    </div>
  );
}
