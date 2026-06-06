import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Issue } from '@/types/issue';
import { issueService } from '@/services/issue';
import { useAuth } from '@/contexts/useAuth';
import EpicRow from './EpicRow';

interface IssueTableProps {
  issues: Issue[];
  projectKey?: string;
  onIssueClick: (issue: Issue) => void;
  onAddChildClick?: (parentId: number) => void;
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

  const epics = issues.filter((issue) => issue.type === 'epic');

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

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b">
            <TableHead className="w-10"></TableHead>
            <TableHead className="min-w-100">Tickets</TableHead>
            <TableHead className="w-48">Personne assignée</TableHead>
            <TableHead className="w-32">Points</TableHead>
            <TableHead className="w-32">État</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {epics.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Aucun ticket
              </TableCell>
            </TableRow>
          ) : (
            epics.map((epic) => (
              <EpicRow
                key={epic.id}
                epic={epic}
                projectKey={projectKey}
                isExpanded={expandedEpics.has(epic.id)}
                isLoading={loadingEpics.has(epic.id)}
                children={childrenByEpic[epic.id] || []}
                onToggle={(e) => toggleEpic(epic.id, e)}
                onClick={() => onIssueClick(epic)}
                onAddChild={onAddChildClick ? () => onAddChildClick(epic.id) : undefined}
                onChildClick={onIssueClick}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
