import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, X } from 'lucide-react';

interface Item {
  publicId: string;
  name: string;
  display?: string;
}

interface SearchableSelectProps {
  items: Item[];
  selectedId?: string;
  onSelect: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  items,
  selectedId,
  onSelect,
  placeholder = 'Seleccionar...',
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selectedItem = selectedId ? items.find(i => i.publicId === selectedId) : undefined;

  const filteredItems = items.filter(item => {
    const displayText = (item.display || item.name).toLowerCase();
    const query = searchQuery.toLowerCase();
    return displayText.includes(query);
  });

  const handleSelect = (id: string) => {
    onSelect(id);
    setIsOpen(false);
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
    <div className="relative w-full" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-3 py-2 text-left border rounded-md bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
      >
        <span className={selectedItem ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedItem ? (selectedItem.display || selectedItem.name) : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

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
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors ${
                    selectedId === item.publicId ? 'bg-primary text-primary-foreground' : ''
                  }`}
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
  );
}
