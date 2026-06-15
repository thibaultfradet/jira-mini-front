import { ChevronDown, ChevronRight } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';
import SprintKanbanColumn from './SprintKanbanColumn';
import type { Sprint } from '@/types/sprint';

type SprintIssue = NonNullable<Sprint['issues']>[number];
type Assignee = NonNullable<SprintIssue['assignee']>;

interface SprintMemberSectionProps {
  sectionKey: string;
  assignee: Assignee | null;
  issues: SprintIssue[];
  columns: { key: string; label: string; className: string }[];
  collapsed: boolean;
  onToggle: () => void;
  onOpenIssue: (id: number) => void;
  typeIconsMap?: Record<string, React.ReactNode>;
}

export default function SprintMemberSection({
  sectionKey,
  assignee,
  issues,
  columns,
  collapsed,
  onToggle,
  onOpenIssue,
  typeIconsMap,
}: SprintMemberSectionProps) {
  const name = assignee ? `${assignee.firstName} ${assignee.lastName}` : 'Non assigné';

  const grouped: Record<string, SprintIssue[]> = { todo: [], in_progress: [], done: [] };
  for (const issue of issues) {
    const key = issue.status in grouped ? issue.status : 'todo';
    grouped[key].push(issue);
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-3 py-2.5 bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <UserAvatar user={assignee} className="h-7 w-7 shrink-0" textClassName="text-[11px]" iconClassName="h-4 w-4" />
        <span className="text-sm font-semibold">{name}</span>
        <span className="text-xs text-muted-foreground bg-white rounded-full px-2 py-0.5 border">
          {issues.length}
        </span>
      </button>

      {!collapsed && (
        <div className="grid grid-cols-3 gap-3 p-3">
          {columns.map((col) => (
            <SprintKanbanColumn
              key={col.key}
              droppableId={`${sectionKey}:${col.key}`}
              label={col.label}
              className={col.className}
              issues={grouped[col.key]}
              onOpenIssue={onOpenIssue}
              typeIconsMap={typeIconsMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}
