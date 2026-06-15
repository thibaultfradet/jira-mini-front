import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Issue, IssueStatus } from '@/types/issue';
import { issueService } from '@/services/issue';
import { useAuth } from '@/contexts/useAuth';
import { showErrorToast } from '@/utils/toastHelpers';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import EpicRow from './EpicRow';

interface IssueTableProps {
  issues: Issue[];
  projectKey?: string;
  onIssueClick: (issue: Issue) => void;
  onAddChildClick?: (parentId: number) => void;
}

type SortCol = 'title' | 'assignee' | 'points' | 'status';
type SortDir = 'asc' | 'desc';

const STATUS_ORDER: Record<string, number> = { todo: 0, in_progress: 1, done: 2 };

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="h-3.5 w-3.5 ml-1 text-muted-foreground/60" />;
  return dir === 'asc'
    ? <ChevronUp className="h-3.5 w-3.5 ml-1" />
    : <ChevronDown className="h-3.5 w-3.5 ml-1" />;
}

export default function IssueTable({
  issues,
  projectKey = 'PROJ',
  onIssueClick,
  onAddChildClick,
}: IssueTableProps) {
  const { logout } = useAuth();
  const [expandedEpics, setExpandedEpics] = useState<Set<number>>(new Set());
  const [loadingEpics, setLoadingEpics] = useState<Set<number>>(new Set());
  const [childrenByEpic, setChildrenByEpic] = useState<Record<number, Issue[]>>({});
  const [statusOverrides, setStatusOverrides] = useState<Record<number, IssueStatus>>({});
  const [sortCol, setSortCol] = useState<SortCol>('title');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const withStatus = (issue: Issue): Issue =>
    statusOverrides[issue.id] ? { ...issue, status: statusOverrides[issue.id] } : issue;

  const handleStatusChange = async (issueId: number, newStatus: IssueStatus) => {
    setStatusOverrides((o) => ({ ...o, [issueId]: newStatus }));
    const updated = await issueService.update(logout, issueId, { status: newStatus });
    if (!updated) {
      setStatusOverrides((o) => {
        const next = { ...o };
        delete next[issueId];
        return next;
      });
      showErrorToast('Impossible de mettre à jour le statut');
    }
  };

  const epics = issues.filter((issue) => issue.type === 'epic');

  const handleSort = (col: SortCol) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const sortedEpics = [...epics].sort((a, b) => {
    let cmp = 0;
    switch (sortCol) {
      case 'title':
        cmp = a.title.localeCompare(b.title);
        break;
      case 'assignee': {
        const nameA = a.assignee ? `${a.assignee.firstName} ${a.assignee.lastName}` : '';
        const nameB = b.assignee ? `${b.assignee.firstName} ${b.assignee.lastName}` : '';
        cmp = nameA.localeCompare(nameB);
        break;
      }
      case 'points':
        cmp = (a.storyPoints ?? -1) - (b.storyPoints ?? -1);
        break;
      case 'status':
        cmp = (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0);
        break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const toggleEpic = async (epicId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (expandedEpics.has(epicId)) {
      setExpandedEpics((prev) => {
        const next = new Set(prev);
        next.delete(epicId);
        return next;
      });
    } else {
      setExpandedEpics((prev) => new Set(prev).add(epicId));

      if (!childrenByEpic[epicId]) {
        setLoadingEpics((prev) => new Set(prev).add(epicId));
        const children = await issueService.getChildren(logout, epicId);
        setChildrenByEpic((prev) => ({ ...prev, [epicId]: children }));
        setLoadingEpics((prev) => {
          const next = new Set(prev);
          next.delete(epicId);
          return next;
        });
      }
    }
  };

  const th = (col: SortCol, label: string, className?: string) => (
    <TableHead
      className={`cursor-pointer select-none hover:text-foreground transition-colors ${className ?? ''}`}
      onClick={() => handleSort(col)}
    >
      <div className="flex items-center">
        {label}
        <SortIcon active={sortCol === col} dir={sortDir} />
      </div>
    </TableHead>
  );

  return (
    <div className="bg-card border border-border/40 mt-2">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b">
            <TableHead className="w-10" />
            {th('title',    'Tickets',           'min-w-100')}
            {th('assignee', 'Personne assignée', 'w-48')}
            {th('points',   'Points',            'w-32')}
            {th('status',   'État',              'w-32')}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedEpics.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Aucun ticket
              </TableCell>
            </TableRow>
          ) : (
            sortedEpics.map((epic) => (
              <EpicRow
                key={epic.id}
                epic={withStatus(epic)}
                projectKey={projectKey}
                isExpanded={expandedEpics.has(epic.id)}
                isLoading={loadingEpics.has(epic.id)}
                children={(childrenByEpic[epic.id] || []).map(withStatus)}
                onToggle={(e) => toggleEpic(epic.id, e)}
                onClick={() => onIssueClick(epic)}
                onAddChild={onAddChildClick ? () => onAddChildClick(epic.id) : undefined}
                onChildClick={onIssueClick}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
