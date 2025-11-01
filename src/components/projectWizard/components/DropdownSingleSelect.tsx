import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Item {
  publicId: string;
  name: string;
  display?: string;
}

interface DropdownSingleSelectProps {
  items: Item[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onRemove: () => void;
  placeholder?: string;
  disabled?: boolean;
  showRemove?: boolean;
}

export function DropdownSingleSelect({
  items,
  selectedId,
  onSelect,
  onRemove,
  placeholder = 'Seleccionar...',
  disabled = false,
  showRemove = true,
}: DropdownSingleSelectProps) {
  const selectedItem = selectedId ? items.find(i => i.publicId === selectedId) : undefined;
  const availableItems = selectedId ? items : items;

  return (
    <div className="space-y-2">
      <Select value={selectedId || ''} onValueChange={onSelect} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-60 overflow-y-auto">
          {availableItems.map(item => (
            <SelectItem key={item.publicId} value={item.publicId}>
              {item.display || item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedItem && showRemove && (
        <div className="flex items-center gap-2">
          <Badge variant="outline">{selectedItem.display || selectedItem.name}</Badge>
          <button
            onClick={onRemove}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
