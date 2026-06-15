import { AlertTriangle, Calendar } from 'lucide-react';
import { getDeadlineBadgeClass, formatDate } from '@/utils/dateUtils';
import type { IssueUrgency } from '@/types/issue';

const urgencyConfig: Record<IssueUrgency, { label: string; className: string }> = {
  low: { label: 'Faible', className: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Moyenne', className: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'Haute', className: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Critique', className: 'bg-red-100 text-red-700' },
};

export function UrgencyBadge({ urgency }: { urgency: IssueUrgency }) {
  const cfg = urgencyConfig[urgency];
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-semibold ${cfg.className}`}>
      {urgency === 'critical' && <AlertTriangle className="h-3 w-3" />}
      {cfg.label}
    </span>
  );
}

export function DeadlineBadge({ deadline }: { deadline: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-semibold ${getDeadlineBadgeClass(deadline)}`}>
      <Calendar className="h-3 w-3" />
      {formatDate(deadline)}
    </span>
  );
}
