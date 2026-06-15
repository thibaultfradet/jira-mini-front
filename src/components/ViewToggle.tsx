import { List, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ViewMode } from '@/utils/viewMode';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-md border overflow-hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange('table')}
        className={cn('h-8 w-8 rounded-none', value === 'table' && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary')}
        title="Vue tableau"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange('card')}
        className={cn('h-8 w-8 rounded-none border-l', value === 'card' && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary')}
        title="Vue cartes"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  );
}
