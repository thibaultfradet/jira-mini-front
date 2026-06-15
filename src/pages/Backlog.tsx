import { useEffect, useState } from 'react';
import { issueService } from '@/services/issue';
import { sprintService } from '@/services/sprint';
import { useAuth } from '@/contexts/useAuth';
import { useTeamPreference } from '@/contexts/useTeamPreference';
import type { Issue } from '@/types/issue';
import type { Sprint } from '@/types/sprint';
import type { SubTask } from '@/types/subtask';
import { showSuccessToast } from '@/utils/toastHelpers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Bug,
  BookOpen,
  CheckSquare,
  Layers,
  Plus,
  ChevronRight,
  ChevronDown,
  Loader2,
  X,
  ListChecks,
} from 'lucide-react';
import { UrgencyBadge, DeadlineBadge } from '@/components/UrgencyBadge';
import { statusConfig } from '@/utils/issueUtils';
import IssueDialog from './project/IssueDialog';

const typeIcons: Record<string, React.ReactNode> = {
  bug: <Bug className="h-4 w-4 text-red-500" />,
  story: <BookOpen className="h-4 w-4 text-green-600" />,
  task: <CheckSquare className="h-4 w-4 text-blue-500" />,
  epic: <Layers className="h-4 w-4 text-purple-500" />,
};

export default function Backlog() {
  const { logout } = useAuth();
  const { teams, selectedTeamId: preferredTeamId } = useTeamPreference();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  // overrideTeamId is set when the user explicitly changes the filter locally
  const [overrideTeamId, setOverrideTeamId] = useState<string | null>(null);
  const selectedTeamId = overrideTeamId ?? (preferredTeamId ? String(preferredTeamId) : '');
  const [loading, setLoading] = useState(true);
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [movingId, setMovingId] = useState<number | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');

  // Expand / collapse checklist
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [subTasksByIssue, setSubTasksByIssue] = useState<Record<number, SubTask[]>>({});
  const [loadingSubsId, setLoadingSubsId] = useState<number | null>(null);

  // Multi-select
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkAssigning, setBulkAssigning] = useState(false);

  useEffect(() => {
    issueService.getBacklog(logout).then((iss) => {
      setIssues(iss);
      setLoading(false);
    });
  }, [logout]);

  useEffect(() => {
    if (!selectedTeamId) return;
    sprintService.getAll(logout, Number(selectedTeamId)).then((s) => {
      setSprints(s.filter((sp) => sp.status === 'planned' || sp.status === 'active'));
    });
  }, [logout, selectedTeamId]);

  const handleMoveToSprint = async (issueId: number, sprintId: number) => {
    setMovingId(issueId);
    const ok = await sprintService.addIssue(logout, sprintId, issueId);
    if (ok) {
      removeIssues([issueId]);
      showSuccessToast('Tâche ajoutée au sprint');
    }
    setMovingId(null);
  };

  const handleBulkAssign = async (sprintId: number) => {
    const ids = [...selectedIds];
    setBulkAssigning(true);
    const results = await Promise.all(ids.map((id) => sprintService.addIssue(logout, sprintId, id)));
    const moved = ids.filter((_, i) => results[i]);
    if (moved.length > 0) {
      removeIssues(moved);
      showSuccessToast(`${moved.length} tâche(s) ajoutée(s) au sprint`);
    }
    setSelectedIds(new Set());
    setBulkAssigning(false);
  };

  const removeIssues = (ids: number[]) => {
    const idSet = new Set(ids);
    setIssues((prev) => prev.filter((i) => !idSet.has(i.id)));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  };

  const toggleExpand = async (issue: Issue) => {
    const next = new Set(expandedIds);
    if (next.has(issue.id)) {
      next.delete(issue.id);
      setExpandedIds(next);
      return;
    }
    next.add(issue.id);
    setExpandedIds(next);
    if (!subTasksByIssue[issue.id]) {
      setLoadingSubsId(issue.id);
      const subs = await issueService.getSubTasks(logout, issue.id);
      setSubTasksByIssue((prev) => ({ ...prev, [issue.id]: subs }));
      setLoadingSubsId(null);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filtering
  const filteredIssues = issues.filter(
    (i) =>
      (filterType === 'all' || i.type === filterType) &&
      (filterProject === 'all' || String(i.project?.id) === filterProject) &&
      (filterAssignee === 'all' ||
        (filterAssignee === 'unassigned' ? !i.assignee : String(i.assignee?.id) === filterAssignee)) &&
      (filterStatus === 'all' || i.status === filterStatus) &&
      (filterUrgency === 'all' || i.urgency === filterUrgency),
  );

  // Distinct filter options derived from the loaded backlog
  const projectOptions = Array.from(
    new Map(issues.map((i) => [i.project?.id, i.project])).values(),
  ).filter((p): p is NonNullable<typeof p> => !!p);
  const assigneeOptions = Array.from(
    new Map(issues.filter((i) => i.assignee).map((i) => [i.assignee!.id, i.assignee!])).values(),
  );
  const hasUnassigned = issues.some((i) => !i.assignee);

  const allVisibleSelected = filteredIssues.length > 0 && filteredIssues.every((i) => selectedIds.has(i.id));
  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      removeFromSelection(filteredIssues.map((i) => i.id));
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredIssues.forEach((i) => next.add(i.id));
        return next;
      });
    }
  };
  const removeFromSelection = (ids: number[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
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

  return (
    <div className="space-y-4 pb-24">
      <div>
        <h1 className="text-2xl font-bold">Backlog</h1>
        <p className="text-muted-foreground text-sm">
          {filteredIssues.length} tâche{filteredIssues.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filtres — deux lignes sous le titre */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-44 h-8 text-sm"><SelectValue placeholder="Projet" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les projets</SelectItem>
              {projectOptions.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger className="w-44 h-8 text-sm"><SelectValue placeholder="Assigné" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les assignés</SelectItem>
              {hasUnassigned && <SelectItem value="unassigned">Non assigné</SelectItem>}
              {assigneeOptions.map((a) => (
                <SelectItem key={a.id} value={String(a.id)}>{a.firstName} {a.lastName}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {teams.length > 0 && (
            <Select value={selectedTeamId} onValueChange={setOverrideTeamId}>
              <SelectTrigger className="w-44 h-8 text-sm"><SelectValue placeholder="Équipe" /></SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-36 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="task">Tâches</SelectItem>
              <SelectItem value="story">Stories</SelectItem>
              <SelectItem value="bug">Bugs</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 h-8 text-sm"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="todo">À faire</SelectItem>
              <SelectItem value="in_progress">En cours</SelectItem>
              <SelectItem value="done">Terminé</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterUrgency} onValueChange={setFilterUrgency}>
            <SelectTrigger className="w-36 h-8 text-sm"><SelectValue placeholder="Urgence" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes urgences</SelectItem>
              <SelectItem value="critical">Critique</SelectItem>
              <SelectItem value="high">Haute</SelectItem>
              <SelectItem value="medium">Moyenne</SelectItem>
              <SelectItem value="low">Faible</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredIssues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckSquare className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Aucune tâche</p>
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {/* En-tête : tout sélectionner */}
          <div className="flex items-center gap-3 px-4 py-2 bg-muted/30">
            <Checkbox
              checked={allVisibleSelected}
              onCheckedChange={toggleSelectAll}
              className="cursor-pointer"
              aria-label="Tout sélectionner"
            />
            <span className="text-xs text-muted-foreground">Sélectionner tout</span>
          </div>

          {filteredIssues.map((issue) => {
            const isExpanded = expandedIds.has(issue.id);
            const subs = subTasksByIssue[issue.id];
            return (
              <div key={issue.id}>
                <div className="flex items-center gap-2 px-4 py-3 hover:bg-muted/30 transition-colors">
                  <Checkbox
                    checked={selectedIds.has(issue.id)}
                    onCheckedChange={() => toggleSelect(issue.id)}
                    className="cursor-pointer shrink-0"
                    aria-label={`Sélectionner ${issue.title}`}
                  />

                  <button
                    onClick={() => toggleExpand(issue)}
                    className="p-0.5 hover:bg-muted rounded cursor-pointer shrink-0"
                    title={isExpanded ? 'Replier' : 'Voir les sous-tâches'}
                  >
                    {loadingSubsId === issue.id ? (
                      <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                    ) : isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  <div className="shrink-0">{typeIcons[issue.type] ?? typeIcons.task}</div>

                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => { setSelectedIssueId(issue.id); setDialogOpen(true); }}
                  >
                    <p className="text-sm font-medium truncate">{issue.title}</p>
                    <p className="text-xs text-muted-foreground">{issue.project?.name}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded font-semibold ${statusConfig[issue.status]?.className ?? statusConfig.todo.className}`}>
                      {statusConfig[issue.status]?.label ?? statusConfig.todo.label}
                    </span>
                    {issue.urgency && <UrgencyBadge urgency={issue.urgency} />}
                    {issue.deadline && <DeadlineBadge deadline={issue.deadline} />}
                    {sprints.length > 0 && (
                      <Select
                        onValueChange={(val) => handleMoveToSprint(issue.id, Number(val))}
                        disabled={movingId === issue.id}
                      >
                        <SelectTrigger className="h-7 w-36 text-xs border-dashed">
                          <Plus className="h-3 w-3 mr-1" />
                          <SelectValue placeholder="Ajouter au sprint" />
                        </SelectTrigger>
                        <SelectContent>
                          {sprints.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.name} {s.status === 'active' && '(actif)'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                {/* Sous-tâches (checklist), indentées sous la flèche */}
                {isExpanded && (
                  <div className="pl-20 pr-4 pb-3 -mt-1">
                    {!subs ? null : subs.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic py-1">Aucune sous-tâche</p>
                    ) : (
                      <div className="space-y-1.5 border-l pl-4">
                        {subs.map((s) => (
                          <div key={s.id} className="flex items-center gap-2">
                            <ListChecks className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className={`text-sm ${s.isDone ? 'line-through text-muted-foreground' : ''}`}>
                              {s.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Barre d'action flottante (multi-sélection) */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-full bg-foreground text-background shadow-lg pl-5 pr-3 py-2.5">
          <span className="text-sm font-medium whitespace-nowrap">
            {selectedIds.size} sélectionnée{selectedIds.size !== 1 ? 's' : ''}
          </span>
          {sprints.length > 0 ? (
            <Select onValueChange={(val) => handleBulkAssign(Number(val))} disabled={bulkAssigning}>
              <SelectTrigger className="h-8 w-44 text-sm bg-background text-foreground border-0">
                {bulkAssigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                <SelectValue placeholder="Affecter à un sprint" />
              </SelectTrigger>
              <SelectContent>
                {sprints.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name} {s.status === 'active' && '(actif)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-xs text-background/70">Aucun sprint disponible</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedIds(new Set())}
            className="h-8 w-8 text-background hover:bg-background/20 hover:text-background rounded-full"
            title="Désélectionner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <IssueDialog issueId={selectedIssueId} open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setSelectedIssueId(null); }} />
    </div>
  );
}
