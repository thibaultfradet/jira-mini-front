import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bug, BookOpen, CheckSquare, Layers, AlertTriangle } from 'lucide-react';
import { dashboardService } from '@/services/dashboard';
import { useAuth } from '@/contexts/useAuth';
import { statusConfig } from '@/utils/issueUtils';
import ProjectCard from '@/components/ProjectCard';
import type { DashboardData } from '@/types/custom/dashboard';
import type { IssueType } from '@/types/issue';
import { getDeadlineBadgeClass, formatDate } from '@/utils/dateUtils';

const issueTypeIcons: Record<IssueType, React.ReactNode> = {
  bug: <Bug className="h-4 w-4 text-red-500" />,
  story: <BookOpen className="h-4 w-4 text-green-600" />,
  task: <CheckSquare className="h-4 w-4 text-blue-500" />,
  epic: <Layers className="h-4 w-4 text-purple-500" />,
};

export default function Dashboard() {
  const { logout } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getDashboard(logout).then((result) => {
      setData(result);
      setLoading(false);
    });
  }, [logout]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const projects = data?.projects ?? [];
  const inProgressIssues = data?.myTasks.inProgress ?? [];
  const todoIssues = data?.myTasks.todo ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Bienvenue sur Mini Jira !</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Projets récents</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
          {projects.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full py-4">Aucun projet.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Mes tâches assignées</h2>

        {inProgressIssues.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-muted-foreground mb-3 tracking-wide">EN COURS</h3>
            <div className="space-y-1">
              {inProgressIssues.map((issue) => (
                <IssueRow key={issue.id} issue={issue} />
              ))}
            </div>
          </div>
        )}

        {todoIssues.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-muted-foreground mb-3 tracking-wide">À FAIRE</h3>
            <div className="space-y-1">
              {todoIssues.map((issue) => (
                <IssueRow key={issue.id} issue={issue} />
              ))}
            </div>
          </div>
        )}

        {inProgressIssues.length === 0 && todoIssues.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">Aucune tâche assignée.</p>
        )}
      </div>
    </div>
  );
}

function IssueRow({ issue }: { issue: DashboardData['myTasks']['inProgress'][0] }) {
  const config = statusConfig[issue.status] ?? statusConfig.todo;
  const projectKey = issue.project?.name ? issue.project.name.split(' ')[0].toUpperCase().slice(0, 3) : '???';

  return (
    <Link
      to={`/projects/${issue.project?.id}`}
      className="flex items-center justify-between py-3 px-2 hover:bg-muted/50 rounded-md transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="text-muted-foreground">{issueTypeIcons[issue.type as IssueType]}</div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{issue.title}</p>
          <p className="text-xs text-muted-foreground">
            {projectKey}-{issue.id} · {issue.project?.name}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-4">
        {issue.urgency === 'critical' && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
        {issue.deadline && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${getDeadlineBadgeClass(issue.deadline)}`}>
            {formatDate(issue.deadline)}
          </span>
        )}
        <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${config.className}`}>
          {config.label}
        </div>
      </div>
    </Link>
  );
}
