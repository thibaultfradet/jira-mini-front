import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import DraggableSprintCard from './DraggableSprintCard';
import type { Sprint } from '@/types/sprint';

type SprintIssue = NonNullable<Sprint['issues']>[number];

interface SprintKanbanColumnProps {
  /** Unique droppable id, e.g. `${sectionKey}:${status}` */
  droppableId: string;
  label: string;
  className: string;
  issues: SprintIssue[];
  onOpenIssue: (id: number) => void;
  typeIconsMap?: Record<string, React.ReactNode>;
}

export default function SprintKanbanColumn({
  droppableId,
  label,
  className,
  issues,
  onOpenIssue,
  typeIconsMap,
}: SprintKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });

  return (
    <div className={cn('flex flex-col rounded-lg border overflow-hidden', className, isOver && 'ring-2 ring-primary')}>
      <div className="px-3 py-2 border-b bg-white/50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{label}</span>
          <span className="text-xs text-muted-foreground bg-white rounded-full px-2 py-0.5 border">
            {issues.length}
          </span>
        </div>
      </div>

      <div ref={setNodeRef} className="flex-1 overflow-y-auto p-2 space-y-2 min-h-24">
        {issues.map((issue) => (
          <DraggableSprintCard
            key={issue.id}
            issue={issue}
            onOpen={() => onOpenIssue(issue.id)}
            typeIconsMap={typeIconsMap}
          />
        ))}
      </div>
    </div>
  );
}
