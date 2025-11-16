import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, X, Plus } from 'lucide-react';

interface Item {
  publicId: string;
  name: string;
  display?: string;
}

interface SearchableMultiSelectProps {
  items: Item[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onAddNew?: () => void;
  placeholder?: string;
  disabled?: boolean;
  hideAddButton?: boolean;
}

export function SearchableMultiSelect({
  items,
  selectedIds,
  onSelect,
  onRemove,
  onAddNew,
  placeholder = 'Seleccionar...',
  disabled = false,
  hideAddButton = !onAddNew,
}: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selectedItems = items.filter(i => selectedIds.includes(i.publicId));
  const availableItems = items.filter(i => !selectedIds.includes(i.publicId));

  const filteredItems = availableItems.filter(item => {
    const displayText = (item.display || item.name).toLowerCase();
    const query = searchQuery.toLowerCase();
    return displayText.includes(query);
  });

  const handleSelect = (id: string) => {
    onSelect(id);
    setSearchQuery('');
  };

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="space-y-2">
      <div className="relative w-full" ref={containerRef}>
        <div className="flex gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled || availableItems.length === 0}
            className="flex-1 px-3 py-2 text-left border rounded-md bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
          >
            <span className="text-muted-foreground">
              {placeholder}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </button>
          {!hideAddButton && onAddNew && (
            <Button type="button" variant="outline" size="sm" onClick={onAddNew} disabled={disabled}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 border rounded-md bg-white shadow-lg z-50">
            <div className="p-2 border-b">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8"
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <button
                    key={item.publicId}
                    onClick={() => handleSelect(item.publicId)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                  >
                    {item.display || item.name}
                  </button>
                ))
              ) : (
                <div className="p-3 text-sm text-muted-foreground text-center">
                  {searchQuery ? 'Sin resultados' : 'Sin opciones'}
                </div>
              )}
            </div>
          </div>
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
