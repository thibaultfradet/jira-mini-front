import { useEffect, useState } from 'react';
import { issueService } from '@/services/issue';
import { sprintService } from '@/services/sprint';
import { useAuth } from '@/contexts/useAuth';
import { useTeamPreference } from '@/contexts/useTeamPreference';
import type { Issue } from '@/types/issue';
import type { Sprint } from '@/types/sprint';
import { showSuccessToast } from '@/utils/toastHelpers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bug, BookOpen, CheckSquare, Layers, AlertTriangle, Calendar, Plus } from 'lucide-react';
import { getDeadlineBadgeClass, formatDate } from '@/utils/dateUtils';
import IssueDialog from './project/IssueDialog';

const typeIcons: Record<string, React.ReactNode> = {
  bug: <Bug className="h-4 w-4 text-red-500" />,
  story: <BookOpen className="h-4 w-4 text-green-600" />,
  task: <CheckSquare className="h-4 w-4 text-blue-500" />,
  epic: <Layers className="h-4 w-4 text-purple-500" />,
};

const urgencyColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
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
  const [filterType, setFilterType] = useState<string>('all');

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
      setIssues((prev) => prev.filter((i) => i.id !== issueId));
      showSuccessToast('Tâche ajoutée au sprint');
    }
    setMovingId(null);
  };

  const filteredIssues = filterType === 'all' ? issues : issues.filter((i) => i.type === filterType);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Backlog</h1>
          <p className="text-muted-foreground text-sm">{filteredIssues.length} tâche{filteredIssues.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="task">Tâches</SelectItem>
              <SelectItem value="story">Stories</SelectItem>
              <SelectItem value="bug">Bugs</SelectItem>
            </SelectContent>
          </Select>
          {teams.length > 0 && (
            <Select value={selectedTeamId} onValueChange={setOverrideTeamId}>
              <SelectTrigger className="w-44 h-8 text-sm">
                <SelectValue placeholder="Équipe" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {filteredIssues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckSquare className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Le backlog est vide</p>
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {filteredIssues.map((issue) => (
            <div key={issue.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
              <div className="shrink-0">{typeIcons[issue.type] ?? typeIcons.task}</div>

              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { setSelectedIssueId(issue.id); setDialogOpen(true); }}>
                <p className="text-sm font-medium truncate">{issue.title}</p>
                <p className="text-xs text-muted-foreground">{issue.project?.name}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {issue.urgency && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${urgencyColors[issue.urgency]}`}>
                    {issue.urgency === 'critical' && <AlertTriangle className="h-3 w-3 inline mr-0.5" />}
                    {issue.urgency}
                  </span>
                )}
                {issue.deadline && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5 ${getDeadlineBadgeClass(issue.deadline)}`}>
                    <Calendar className="h-2.5 w-2.5" />
                    {formatDate(issue.deadline)}
                  </span>
                )}
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
          ))}
        </div>
      )}

      <IssueDialog issueId={selectedIssueId} open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setSelectedIssueId(null); }} />
    </div>
  );
}
