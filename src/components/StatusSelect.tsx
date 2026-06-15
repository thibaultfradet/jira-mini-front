import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { statusConfig } from '@/utils/issueUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { IssueStatus } from '@/types/issue';

const STATUSES: IssueStatus[] = ['todo', 'in_progress', 'done'];

interface StatusSelectProps {
  status: string;
  onChange: (status: IssueStatus) => void;
  disabled?: boolean;
}

export default function StatusSelect({ status, onChange, disabled }: StatusSelectProps) {
  const config = statusConfig[status] || statusConfig.todo;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold cursor-pointer select-none',
            config.className,
          )}
        >
          {config.label}
          <ChevronDown className="h-3 w-3" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
        {STATUSES.map((s) => (
          <DropdownMenuItem
            key={s}
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (s !== status) onChange(s);
            }}
          >
            <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold', statusConfig[s].className)}>
              {statusConfig[s].label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
