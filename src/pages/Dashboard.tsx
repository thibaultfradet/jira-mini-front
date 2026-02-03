import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bug, BookOpen, CheckSquare, Layers } from "lucide-react";
import { dashboardService } from "@/services/dashboard";
import type { DashboardResponse } from "@/services/dashboard";
import { statusConfig } from "@/helpers";
import ProjectCard from "@/components/ProjectCard";
import type { Issue, IssueType } from "@/types";

const issueTypeIcons: Record<IssueType, React.ReactNode> = {
  bug: <Bug className="h-4 w-4 text-red-500" />,
  story: <BookOpen className="h-4 w-4 text-green-600" />,
  task: <CheckSquare className="h-4 w-4 text-blue-500" />,
  epic: <Layers className="h-4 w-4 text-purple-500" />,
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await dashboardService.getDashboard();
        setData(result);
      } catch (error) {
        console.error("Erreur lors du chargement du tableau de bord:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
      {/* Titre */}
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenue sur Mini Jira ! Vous êtes connecté.
        </p>
      </div>

      {/* Section Projets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Espaces récents</h2>
          <Link
            to="#"
            className="text-sm text-primary hover:underline cursor-pointer"
          >
            Afficher tous les espaces
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>

      {/* Section Tâches assignées */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Mes tâches assignées</h2>

        {/* En cours */}
        {inProgressIssues.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-muted-foreground mb-3 tracking-wide">
              EN COURS
            </h3>
            <div className="space-y-1">
              {inProgressIssues.map((issue) => (
                <IssueRow key={issue.id} issue={issue} />
              ))}
            </div>
          </div>
        )}

        {/* À faire */}
        {todoIssues.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-muted-foreground mb-3 tracking-wide">
              A FAIRE
            </h3>
            <div className="space-y-1">
              {todoIssues.map((issue) => (
                <IssueRow key={issue.id} issue={issue} />
              ))}
            </div>
          </div>
        )}

        {inProgressIssues.length === 0 && todoIssues.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Aucune tâche assignée.
          </p>
        )}
      </div>
    </div>
  );
}

function IssueRow({ issue }: { issue: Issue }) {
  const config = statusConfig[issue.status] || statusConfig.todo;
  const projectKey = issue.project?.name
    ? issue.project.name.split(" ")[0].toUpperCase().slice(0, 3)
    : "???";
  const issueKey = `${projectKey}-${issue.id}`;

  return (
    <Link
      to={`/projects/${issue.project?.id}`}
      className="flex items-center justify-between py-3 px-2 hover:bg-muted/50 rounded-md transition-colors group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="text-muted-foreground">
          {issueTypeIcons[issue.type]}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{issue.title}</p>
          <p className="text-xs text-muted-foreground">
            {issueKey} &middot;{" "}
            {issue.assignee
              ? `${issue.assignee.firstName} ${issue.assignee.lastName}`
              : ""}{" "}
            - {issue.project?.name}
          </p>
        </div>
      </div>
      <div
        className={`shrink-0 ml-4 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${config.className}`}
      >
        {config.label}
      </div>
    </Link>
  );
}
