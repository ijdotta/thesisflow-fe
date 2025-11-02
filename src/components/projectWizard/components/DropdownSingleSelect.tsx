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
  const [searchQuery, setSearchQuery] = React.useState('');
  const selectedItem = selectedId ? items.find(i => i.publicId === selectedId) : undefined;
  const availableItems = selectedId ? items : items;
  
  const filteredItems = availableItems.filter(item => {
    const displayText = (item.display || item.name).toLowerCase();
    return displayText.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-2">
      <Select value={selectedId || ''} onValueChange={onSelect} disabled={disabled}>
        <SelectTrigger>
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
