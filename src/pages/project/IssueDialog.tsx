import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { issueService } from '@/services/issue';
import { userService } from '@/services/user';
import { useAuth } from '@/contexts/useAuth';
import type { Issue } from '@/types/issue';
import type { SubTask } from '@/types/subtask';
import type { Comment } from '@/types/comment';
import type { User } from '@/types/user';
import { formatDate, getDeadlineBadgeClass } from '@/utils/dateUtils';
import { statusConfig } from '@/utils/issueUtils';
import { showSuccessToast } from '@/utils/toastHelpers';
import { Plus, Send, Calendar, AlertTriangle, User as UserIcon, Bug, BookOpen, CheckSquare, Layers, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface Props {
  issueId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const urgencyLabels: Record<string, { label: string; className: string }> = {
  low: { label: 'Faible', className: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Moyenne', className: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'Haute', className: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Critique', className: 'bg-red-100 text-red-700' },
};

const statusLabels: Record<string, string> = {
  todo: 'À faire',
  in_progress: 'En cours',
  done: 'Terminé',
};

const typeIcons: Record<string, React.ReactNode> = {
  bug: <Bug className="h-3.5 w-3.5 text-red-500 shrink-0" />,
  story: <BookOpen className="h-3.5 w-3.5 text-green-600 shrink-0" />,
  task: <CheckSquare className="h-3.5 w-3.5 text-blue-500 shrink-0" />,
  epic: <Layers className="h-3.5 w-3.5 text-purple-500 shrink-0" />,
};

export default function IssueDialog({ issueId, open, onOpenChange }: Props) {
  const { logout } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [children, setChildren] = useState<Issue[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newSubTask, setNewSubTask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadedIssueId, setLoadedIssueId] = useState<number | null>(null);
  // Navigation interne (breadcrumb / enfants) — surcharge l'issueId fourni par le parent
  const [navId, setNavId] = useState<number | null>(null);
  const [prevIssueId, setPrevIssueId] = useState<number | null>(issueId);

  // Réinitialise la navigation interne quand le parent ouvre une autre tâche
  if (issueId !== prevIssueId) {
    setPrevIssueId(issueId);
    setNavId(null);
  }

  const currentId = navId ?? issueId;

  // Derived loading: spinner when open id differs from last loaded id
  const loading = open && !!currentId && loadedIssueId !== currentId;

  useEffect(() => {
    if (!open || !currentId) return;

    Promise.all([
      issueService.getById(logout, currentId),
      issueService.getSubTasks(logout, currentId),
      issueService.getChildren(logout, currentId),
      issueService.getComments(logout, currentId),
      userService.getAll(logout),
    ]).then(([iss, subs, kids, comms, usrs]) => {
      setIssue(iss);
      setSubTasks(subs);
      setChildren(kids);
      setComments(comms);
      setUsers(usrs);
      setLoadedIssueId(currentId);
    });
  }, [open, currentId, logout]);

  const handleStatusChange = async (status: string) => {
    if (!issue) return;
    const updated = await issueService.update(logout, issue.id, { status });
    if (updated) setIssue(updated);
  };

  const handleAssigneeChange = async (value: string) => {
    if (!issue) return;
    const assigneeId = value === 'none' ? null : Number(value);
    const updated = await issueService.update(logout, issue.id, { assigneeId });
    if (updated) setIssue(updated);
  };

  const handleUrgencyChange = async (urgency: string) => {
    if (!issue) return;
    const updated = await issueService.update(logout, issue.id, { urgency: urgency === 'none' ? null : urgency });
    if (updated) setIssue(updated);
  };

  const handleDeadlineChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!issue) return;
    const updated = await issueService.update(logout, issue.id, { deadline: e.target.value || null });
    if (updated) setIssue(updated);
  };

  const handleAddSubTask = async () => {
    if (!issue || !newSubTask.trim()) return;
    setSaving(true);
    const created = await issueService.createSubTask(logout, issue.id, newSubTask.trim());
    if (created) {
      setSubTasks((prev) => [...prev, created]);
      setNewSubTask('');
    }
    setSaving(false);
  };

  const handleToggleSubTask = async (subTask: SubTask) => {
    if (!issue) return;
    const updated = await issueService.updateSubTask(logout, issue.id, subTask.id, { isDone: !subTask.isDone });
    if (updated) setSubTasks((prev) => prev.map((s) => (s.id === subTask.id ? updated : s)));
  };

  const handleAddComment = async () => {
    if (!issue || !newComment.trim()) return;
    setSaving(true);
    const created = await issueService.addComment(logout, issue.id, newComment.trim());
    if (created) {
      setComments((prev) => [...prev, created]);
      setNewComment('');
      showSuccessToast('Commentaire ajouté');
    }
    setSaving(false);
  };

  const completedCount = subTasks.filter((s) => s.isDone).length;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) setNavId(null); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        {loading || !issue ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {/* Fil d'Ariane : (parent >) tâche courante — parent cliquable */}
                  <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5 min-w-0">
                    {issue.parent && (
                      <>
                        <button
                          onClick={() => setNavId(issue.parent!.id)}
                          className="flex items-center gap-1 min-w-0 max-w-[40%] hover:text-foreground hover:underline cursor-pointer"
                          title="Ouvrir l'élément parent"
                        >
                          {typeIcons.epic}
                          <span className="truncate">{issue.parent.title}</span>
                        </button>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                      </>
                    )}
                    <span className="flex items-center gap-1 min-w-0 font-medium text-foreground">
                      {typeIcons[issue.type] ?? typeIcons.task}
                      <span className="truncate uppercase">{issue.type}</span>
                    </span>
                  </nav>
                  <DialogTitle className="text-xl leading-tight">{issue.title}</DialogTitle>
                </div>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-8 mt-4">
              {/* Main content */}
              <div className="col-span-2 space-y-6">
                {/* Description */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {issue.description || <span className="italic">Aucune description</span>}
                  </p>
                </div>

                {/* Tâches associées (epics) */}
                {issue.type === 'epic' && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">
                      Tâches associées {children.length > 0 && <span className="text-muted-foreground font-normal">({children.length})</span>}
                    </h4>
                    {children.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">Aucune tâche associée</p>
                    ) : (
                      <div className="border rounded-lg divide-y">
                        {children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => setNavId(child.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/50 transition-colors cursor-pointer text-left"
                          >
                            {typeIcons[child.type] ?? typeIcons.task}
                            <span className="flex-1 min-w-0 truncate text-sm">{child.title}</span>
                            <span className={`shrink-0 inline-flex items-center text-xs px-2 py-0.5 rounded font-semibold ${statusConfig[child.status]?.className ?? statusConfig.todo.className}`}>
                              {statusConfig[child.status]?.label ?? statusConfig.todo.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-tasks (checklist) — masqué pour les epics */}
                {issue.type !== 'epic' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold">
                      Checklist {subTasks.length > 0 && <span className="text-muted-foreground font-normal">({completedCount}/{subTasks.length})</span>}
                    </h4>
                  </div>

                  {subTasks.length > 0 && (
                    <div className="mb-2 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${subTasks.length > 0 ? (completedCount / subTasks.length) * 100 : 0}%` }}
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    {subTasks.map((s) => (
                      <div key={s.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={s.isDone}
                          onCheckedChange={() => handleToggleSubTask(s)}
                          className="cursor-pointer"
                        />
                        <span className={`text-sm ${s.isDone ? 'line-through text-muted-foreground' : ''}`}>{s.title}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      placeholder="Ajouter une sous-tâche..."
                      value={newSubTask}
                      onChange={(e) => setNewSubTask(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubTask(); } }}
                      className="h-8 text-sm"
                    />
                    <Button size="sm" variant="outline" onClick={handleAddSubTask} disabled={saving || !newSubTask.trim()}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                )}

                {/* Comments */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Commentaires ({comments.length})</h4>
                  <div className="space-y-3 mb-3">
                    {comments.map((c) => (
                      <div key={c.id} className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">{c.author.firstName} {c.author.lastName}</span>
                          <span className="text-[10px] text-muted-foreground">{formatDate(c.createdAt)}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">Aucun commentaire</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Ajouter un commentaire..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="text-sm resize-none"
                      rows={2}
                    />
                    <Button size="icon" variant="outline" onClick={handleAddComment} disabled={saving || !newComment.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Status */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">Statut</p>
                  <Select value={issue.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([v, l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Assignee */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                    <UserIcon className="h-3 w-3 inline mr-1" />Assigné à
                  </p>
                  <Select value={issue.assignee?.id?.toString() ?? 'none'} onValueChange={handleAssigneeChange}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Non assigné" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Non assigné</SelectItem>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id.toString()}>
                          {u.firstName} {u.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Urgency */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                    <AlertTriangle className="h-3 w-3 inline mr-1" />Urgence
                  </p>
                  <Select value={issue.urgency ?? 'none'} onValueChange={handleUrgencyChange}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Aucune" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      {Object.entries(urgencyLabels).map(([v, { label }]) => (
                        <SelectItem key={v} value={v}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {issue.urgency && (
                    <Badge className={`mt-1 text-xs ${urgencyLabels[issue.urgency]?.className}`}>
                      {urgencyLabels[issue.urgency]?.label}
                    </Badge>
                  )}
                </div>

                {/* Deadline */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                    <Calendar className="h-3 w-3 inline mr-1" />Deadline
                  </p>
                  <Input
                    type="date"
                    defaultValue={issue.deadline ? issue.deadline.split('T')[0] : ''}
                    onBlur={handleDeadlineChange}
                    className="h-8 text-sm"
                  />
                  {issue.deadline && (
                    <span className={`text-xs mt-1 block ${getDeadlineBadgeClass(issue.deadline)}`}>
                      {formatDate(issue.deadline)}
                    </span>
                  )}
                </div>

                {/* Story points */}
                {issue.storyPoints != null && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">Story points</p>
                    <span className="text-sm font-medium">{issue.storyPoints}</span>
                  </div>
                )}

                {/* Reporter */}
                {issue.reporter && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">Rapporteur</p>
                    <p className="text-sm">{issue.reporter.firstName} {issue.reporter.lastName}</p>
                  </div>
                )}

                {/* Dates */}
                <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                  <p>Créé le {formatDate(issue.createdAt)}</p>
                  <p>Modifié le {formatDate(issue.updatedAt)}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
