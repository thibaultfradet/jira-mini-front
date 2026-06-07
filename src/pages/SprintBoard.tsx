import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

type SprintIssue = NonNullable<Sprint['issues']>[number];

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
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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
    if (updatingId) return;
    setUpdatingId(issue.id);
    const updated = await issueService.update(logout, issue.id, { status: newStatus });
    if (updated) {
      setIssues((prev) => prev.map((i) => (i.id === issue.id ? { ...i, status: updated.status as IssueStatus } : i)));
    }
    setUpdatingId(null);
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

      {/* Kanban board */}
      <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
        {columns.map((col) => (
          <div key={col.key} className={`flex flex-col rounded-lg border ${col.className} overflow-hidden`}>
            <div className="px-3 py-2 border-b bg-white/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{col.label}</span>
                <span className="text-xs text-muted-foreground bg-white rounded-full px-2 py-0.5 border">
                  {grouped[col.key].length}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {grouped[col.key].map((issue) => (
                <SprintIssueCard
                  key={issue.id}
                  issue={issue}
                  onOpen={() => { setSelectedIssueId(issue.id); setDialogOpen(true); }}
                  onStatusChange={handleStatusChange}
                  currentColumn={col.key}
                  loading={updatingId === issue.id}
                  typeIconsMap={typeIcons}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

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
