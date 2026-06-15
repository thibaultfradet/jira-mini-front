import { useDraggable } from '@dnd-kit/core';
import SprintIssueCard from './SprintIssueCard';
import type { Sprint } from '@/types/sprint';

type SprintIssue = NonNullable<Sprint['issues']>[number];

interface DraggableSprintCardProps {
  issue: SprintIssue;
  onOpen: () => void;
  typeIconsMap?: Record<string, React.ReactNode>;
}

export default function DraggableSprintCard({ issue, onOpen, typeIconsMap }: DraggableSprintCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: issue.id,
    data: { status: issue.status },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="cursor-grab active:cursor-grabbing touch-none outline-none"
    >
      <SprintIssueCard issue={issue} onOpen={onOpen} typeIconsMap={typeIconsMap} dragging={isDragging} />
    </div>
  );
}
