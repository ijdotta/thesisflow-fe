import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

interface Item {
  publicId: string;
  name: string;
  display?: string;
}

interface DropdownMultiSelectProps {
  items: Item[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onAddNew: () => void;
  placeholder?: string;
  disabled?: boolean;
  hideAddButton?: boolean;
}

export function DropdownMultiSelect({
  items,
  selectedIds,
  onSelect,
  onRemove,
  onAddNew,
  placeholder = 'Seleccionar...',
  disabled = false,
  hideAddButton = false,
}: DropdownMultiSelectProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const selectedItems = items.filter(i => selectedIds.includes(i.publicId));
  const availableItems = items.filter(i => !selectedIds.includes(i.publicId));
  
  const filteredItems = availableItems.filter(item => {
    const displayText = (item.display || item.name).toLowerCase();
    return displayText.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select onValueChange={onSelect} disabled={disabled || availableItems.length === 0}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            <div className="sticky top-0 bg-white p-2 border-b">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <SelectItem key={item.publicId} value={item.publicId}>
                  {item.display || item.name}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-sm text-muted-foreground text-center">
                {searchQuery ? 'Sin resultados' : 'Sin opciones'}
              </div>
            )}
          </SelectContent>
        </Select>
        {!hideAddButton && (
          <Button type="button" variant="outline" size="sm" onClick={onAddNew} disabled={disabled}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map(item => (
            <Badge key={item.publicId} variant="outline" className="gap-1 pr-1">
              {item.display || item.name}
              <button
                onClick={() => onRemove(item.publicId)}
                className="hover:bg-muted rounded p-0.5"
                aria-label="remove"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
