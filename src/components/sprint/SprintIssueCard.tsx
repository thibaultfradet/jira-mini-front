import { cn } from '@/lib/utils';
import UserAvatar from '@/components/UserAvatar';
import { UrgencyBadge, DeadlineBadge } from '@/components/UrgencyBadge';
import type { Sprint } from '@/types/sprint';

type SprintIssue = NonNullable<Sprint['issues']>[number];

const typeIcons: Record<string, React.ReactNode> = {
  bug: <span className="text-red-500 text-[10px] font-bold">BUG</span>,
  story: <span className="text-green-600 text-[10px] font-bold">STORY</span>,
  task: <span className="text-blue-500 text-[10px] font-bold">TASK</span>,
  epic: <span className="text-purple-500 text-[10px] font-bold">EPIC</span>,
};

interface SprintIssueCardProps {
  issue: SprintIssue;
  onOpen: () => void;
  typeIconsMap?: Record<string, React.ReactNode>;
  /** Visual state while being dragged (used by the drag overlay / source card) */
  dragging?: boolean;
}

export default function SprintIssueCard({ issue, onOpen, typeIconsMap, dragging }: SprintIssueCardProps) {
  const icons = typeIconsMap ?? typeIcons;

  return (
    <div
      onClick={onOpen}
      className={cn(
        'bg-white rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow',
        dragging && 'opacity-50 ring-2 ring-primary',
      )}
    >
      <div className="flex items-start gap-2 mb-2">
        <div className="shrink-0 mt-0.5">{icons[issue.type] ?? icons.task}</div>
        <p className="text-sm font-medium leading-tight flex-1">{issue.title}</p>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {issue.urgency && <UrgencyBadge urgency={issue.urgency} />}
        {issue.deadline && <DeadlineBadge deadline={issue.deadline} />}
      </div>

      <div className="flex items-center justify-end gap-2">
        {issue.storyPoints != null && (
          <span className="flex h-6 min-w-6 items-center justify-center rounded bg-gray-100 px-1.5 text-xs font-bold text-black">
            {issue.storyPoints}
          </span>
        )}
        <UserAvatar user={issue.assignee} className="h-6 w-6" textClassName="text-[10px]" iconClassName="h-3.5 w-3.5" />
      </div>
    </div>
  );
}
