import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sprintService } from '@/services/sprint';
import { issueService } from '@/services/issue';
import { useAuth } from '@/contexts/useAuth';
import type { Sprint } from '@/types/sprint';
import type { IssueStatus } from '@/types/issue';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { showSuccessToast } from '@/utils/toastHelpers';
import { Bug, BookOpen, CheckSquare, Layers, Play, CheckCircle } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';
import IssueDialog from './project/IssueDialog';
import SprintIssueCard from '@/components/sprint/SprintIssueCard';
import SprintMemberSection from '@/components/sprint/SprintMemberSection';

type SprintIssue = NonNullable<Sprint['issues']>[number];
type Assignee = NonNullable<SprintIssue['assignee']>;

const typeIcons: Record<string, React.ReactNode> = {
  bug: <Bug className="h-3.5 w-3.5 text-red-500" />,
  story: <BookOpen className="h-3.5 w-3.5 text-green-600" />,
  task: <CheckSquare className="h-3.5 w-3.5 text-blue-500" />,
  epic: <Layers className="h-3.5 w-3.5 text-purple-500" />,
};

const columns: { key: string; label: string; className: string }[] = [
  { key: 'todo', label: 'À faire', className: 'bg-gray-50 border-gray-200' },
  { key: 'in_progress', label: 'En cours', className: 'bg-blue-50 border-blue-200' },
  { key: 'done', label: 'Terminé', className: 'bg-green-50 border-green-200' },
];

const UNASSIGNED_KEY = 'unassigned';

export default function SprintBoard() {
  const { teamId } = useParams<{ teamId: string }>();
  const { logout } = useAuth();
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [issues, setIssues] = useState<SprintIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [moveToNext, setMoveToNext] = useState(true);
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [activeIssueId, setActiveIssueId] = useState<number | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    if (!teamId) return;
    sprintService.getActive(logout, Number(teamId)).then((s) => {
      setSprint(s);
      if (s) {
        setIssues(s.issues ?? []);
      }
      setLoading(false);
    });
  }, [logout, teamId]);

  const handleStart = async () => {
    if (!sprint) return;
    const started = await sprintService.start(logout, sprint.id);
    if (started) setSprint(started);
  };

  const handleComplete = async () => {
    if (!sprint) return;
    setCompleting(true);
    const result = await sprintService.complete(logout, sprint.id, moveToNext);
    if (result) {
      showSuccessToast(`Sprint terminé — ${result.moved} tâche(s) déplacée(s)`);
      setSprint(null);
      setIssues([]);
      setShowCompleteModal(false);
    }
    setCompleting(false);
  };

  const handleStatusChange = async (issue: SprintIssue, newStatus: string) => {
    // Optimistic update
    setIssues((prev) => prev.map((i) => (i.id === issue.id ? { ...i, status: newStatus as IssueStatus } : i)));
    const updated = await issueService.update(logout, issue.id, { status: newStatus });
    if (!updated) {
      // Revert on failure
      setIssues((prev) => prev.map((i) => (i.id === issue.id ? { ...i, status: issue.status } : i)));
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveIssueId(Number(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveIssueId(null);
    const { active, over } = event;
    if (!over) return;
    // droppable id is `${sectionKey}:${status}` — only the status part drives the change
    const newStatus = String(over.id).split(':')[1];
    const issue = issues.find((i) => i.id === Number(active.id));
    if (!issue || !newStatus || issue.status === newStatus) return;
    handleStatusChange(issue, newStatus);
  };

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <CheckSquare className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <p className="font-semibold">Aucun sprint actif</p>
          <p className="text-sm text-muted-foreground">Créez ou démarrez un sprint pour commencer</p>
        </div>
      </div>
    );
  }

  const grouped: Record<string, SprintIssue[]> = { todo: [], in_progress: [], done: [] };
  for (const issue of issues) {
    const key = issue.status in grouped ? issue.status : 'todo';
    grouped[key].push(issue);
  }

  const donePercent = issues.length > 0 ? Math.round((grouped.done.length / issues.length) * 100) : 0;

  // Sections par personne (style Jira) : un tableau par assigné + « Non assigné » en dernier
  const byAssignee = new Map<number, { assignee: Assignee; issues: SprintIssue[] }>();
  const unassigned: SprintIssue[] = [];
  for (const issue of issues) {
    if (issue.assignee) {
      const entry = byAssignee.get(issue.assignee.id) ?? { assignee: issue.assignee, issues: [] };
      entry.issues.push(issue);
      byAssignee.set(issue.assignee.id, entry);
    } else {
      unassigned.push(issue);
    }
  }
  const memberSections: { key: string; assignee: Assignee | null; issues: SprintIssue[] }[] = [...byAssignee.values()]
    .sort((a, b) =>
      `${a.assignee.firstName} ${a.assignee.lastName}`.localeCompare(`${b.assignee.firstName} ${b.assignee.lastName}`),
    )
    .map((e) => ({ key: `m${e.assignee.id}`, assignee: e.assignee, issues: e.issues }));
  if (unassigned.length > 0) {
    memberSections.push({ key: UNASSIGNED_KEY, assignee: null, issues: unassigned });
  }

  const activeIssue = activeIssueId != null ? issues.find((i) => i.id === activeIssueId) ?? null : null;
  const openIssue = (id: number) => { setSelectedIssueId(id); setDialogOpen(true); };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{sprint.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant={sprint.status === 'active' ? 'default' : 'secondary'}>
              {sprint.status === 'active' ? 'Actif' : sprint.status === 'planned' ? 'Planifié' : 'Terminé'}
            </Badge>
            {sprint.startDate && (
              <span className="text-xs text-muted-foreground">
                {formatDate(sprint.startDate)} → {sprint.endDate ? formatDate(sprint.endDate) : '?'}
              </span>
            )}
            <span className="text-xs text-muted-foreground">{donePercent}% terminé</span>
          </div>
          {sprint.goal && (
            <p className="text-sm text-muted-foreground mt-1 italic">{sprint.goal}</p>
          )}
        </div>
        <div className="flex gap-2">
          {sprint.status === 'planned' && (
            <Button onClick={handleStart} className="gap-2">
              <Play className="h-4 w-4" />
              Démarrer
            </Button>
          )}
          {sprint.status === 'active' && (
            <Button variant="outline" onClick={() => setShowCompleteModal(true)} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Terminer le sprint
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${donePercent}%` }}
        />
      </div>

      {/* Tableaux de sprint par personne (drag & drop) */}
      {memberSections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckSquare className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Aucune tâche dans ce sprint</p>
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
            {memberSections.map((section) => (
              <SprintMemberSection
                key={section.key}
                sectionKey={section.key}
                assignee={section.assignee}
                issues={section.issues}
                columns={columns}
                collapsed={collapsedSections.has(section.key)}
                onToggle={() => toggleSection(section.key)}
                onOpenIssue={openIssue}
                typeIconsMap={typeIcons}
              />
            ))}
          </div>
          <DragOverlay>
            {activeIssue ? (
              <SprintIssueCard issue={activeIssue} onOpen={() => {}} typeIconsMap={typeIcons} />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Complete sprint modal */}
      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminer le sprint</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="font-medium mb-1">Résumé du sprint</p>
              <p>{grouped.done.length} tâche(s) terminée(s) sur {issues.length}</p>
              {grouped.todo.length + grouped.in_progress.length > 0 && (
                <p className="text-muted-foreground mt-1">
                  {grouped.todo.length + grouped.in_progress.length} tâche(s) non terminée(s)
                </p>
              )}
            </div>

            {grouped.todo.length + grouped.in_progress.length > 0 && (
              <div className="flex items-start gap-3">
                <Checkbox
                  id="moveToNext"
                  checked={moveToNext}
                  onCheckedChange={(c) => setMoveToNext(c as boolean)}
                  className="cursor-pointer mt-0.5"
                />
                <div>
                  <label htmlFor="moveToNext" className="text-sm font-medium cursor-pointer">
                    Déplacer vers le prochain sprint planifié
                  </label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Si décoché, les tâches seront remises dans le backlog.
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteModal(false)}>Annuler</Button>
            <Button onClick={handleComplete} disabled={completing}>
              {completing ? 'Finalisation...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <IssueDialog
        issueId={selectedIssueId}
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setSelectedIssueId(null);
        }}
      />
    </div>
  );
}
