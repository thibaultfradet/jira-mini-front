import { AlertTriangle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDeadlineBadgeClass, formatDate } from '@/utils/dateUtils';
import type { Sprint } from '@/types/sprint';
import type { IssueStatus } from '@/types/issue';

type SprintIssue = NonNullable<Sprint['issues']>[number];

const typeIcons: Record<string, React.ReactNode> = {
  bug: <span className="text-red-500 text-[10px] font-bold">BUG</span>,
  story: <span className="text-green-600 text-[10px] font-bold">STORY</span>,
  task: <span className="text-blue-500 text-[10px] font-bold">TASK</span>,
  epic: <span className="text-purple-500 text-[10px] font-bold">EPIC</span>,
};

interface SprintIssueCardProps {
  issue: SprintIssue;
  currentColumn: string;
  onOpen: () => void;
  onStatusChange: (issue: SprintIssue, status: string) => void;
  loading: boolean;
  typeIconsMap?: Record<string, React.ReactNode>;
}

export default function SprintIssueCard({
  issue,
  currentColumn,
  onOpen,
  onStatusChange,
  loading,
  typeIconsMap,
}: SprintIssueCardProps) {
  const icons = typeIconsMap ?? typeIcons;
  const nextStatus: IssueStatus | null =
    currentColumn === 'todo' ? 'in_progress' : currentColumn === 'in_progress' ? 'done' : null;
  const prevStatus: IssueStatus | null =
    currentColumn === 'done' ? 'in_progress' : currentColumn === 'in_progress' ? 'todo' : null;

  return (
    <div
      className={`bg-white rounded-lg border p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${loading ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-2 mb-2" onClick={onOpen}>
        <div className="shrink-0 mt-0.5">{icons[issue.type] ?? icons.task}</div>
        <p className="text-sm font-medium leading-tight flex-1">{issue.title}</p>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {issue.urgency && (
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
              issue.urgency === 'critical'
                ? 'bg-red-100 text-red-700'
                : issue.urgency === 'high'
                  ? 'bg-orange-100 text-orange-700'
                  : issue.urgency === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600'
            }`}
          >
            {issue.urgency === 'critical' && <AlertTriangle className="h-2.5 w-2.5 inline mr-0.5" />}
            {issue.urgency}
          </span>
        )}
        {issue.deadline && (
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5 ${getDeadlineBadgeClass(issue.deadline)}`}
          >
            <Calendar className="h-2.5 w-2.5" />
            {formatDate(issue.deadline)}
          </span>
        )}
        {issue.storyPoints != null && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100">
            {issue.storyPoints} pts
          </span>
        )}
      </div>

      {issue.assignee && (
        <p className="text-[10px] text-muted-foreground mb-2">
          {issue.assignee.firstName} {issue.assignee.lastName}
        </p>
      )}

      <div className="flex gap-1 mt-1">
        {prevStatus && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(issue, prevStatus)}
            disabled={loading}
            className="text-[10px] h-auto py-0.5 px-2"
          >
            ← Retour
          </Button>
        )}
        {nextStatus && (
          <Button
            size="sm"
            onClick={() => onStatusChange(issue, nextStatus)}
            disabled={loading}
            className="text-[10px] h-auto py-0.5 px-2 ml-auto bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 shadow-none"
          >
            Avancer →
          </Button>
        )}
      </div>
    </div>
  );
}
