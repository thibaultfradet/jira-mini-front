import { cn } from '@/lib/utils';
import UserAvatar from '@/components/UserAvatar';

interface AssigneeCellProps {
  assignee: { id: number; firstName: string; lastName: string } | null | undefined;
}

export default function AssigneeCell({ assignee }: AssigneeCellProps) {
  const hasAssignee = !!(assignee?.firstName && assignee?.lastName);

  return (
    <div className={cn('flex items-center gap-2', !hasAssignee && 'text-muted-foreground')}>
      <UserAvatar user={assignee} className="h-6 w-6" textClassName="text-[10px]" iconClassName="h-3.5 w-3.5" />
      <span className="text-sm">
        {hasAssignee ? `${assignee!.firstName} ${assignee!.lastName}` : 'Non assignée'}
      </span>
    </div>
  );
}
