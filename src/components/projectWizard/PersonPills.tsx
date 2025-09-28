import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { PersonBase } from './types';

interface Props {
  list: PersonBase[];
  onRemove: (index: number) => void;
  emptyLabel?: string;
}

export function PersonPills({ list, onRemove, emptyLabel = 'Ninguno' }: Props) {
  if (!list.length) return <div className="text-xs text-muted-foreground">{emptyLabel}</div>;
  return (
    <div className="flex flex-wrap gap-1">
      {list.map((p, i) => (
        <Badge key={i} variant="outline" className="gap-1 pr-1">
          {p.lastname}, {p.name}
          <button
            onClick={() => onRemove(i)}
            className="hover:bg-muted rounded p-0.5"
            aria-label="remove"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
