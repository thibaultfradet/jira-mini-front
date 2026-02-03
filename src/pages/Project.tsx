import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectService } from "@/services/project";
import type { Project as ProjectType, Issue } from "@/types";
import { IssueTable } from "@/components/issue-table";
import IssueDialog from "./project/IssueDialog";

export default function Project() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      try {
        const data = await projectService.getById(Number(id));
        setProject(data);
      } catch (err) {
        console.error("Failed to fetch project:", err);
        setError("Projet non trouvé");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleIssueClick = (issue: Issue) => {
    if (issue.type === "epic") {
      // Navigate to epic view page
      navigate(`/project/${id}/epic/${issue.id}`);
    } else {
      // Open modal for tasks/stories/bugs
      setSelectedIssueId(issue.id);
      setIsDialogOpen(true);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedIssueId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-muted-foreground">Chargement...</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-red-500">{error || "Projet non trouvé"}</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">{project.name}</h1>
        {project.description && (
          <p className="text-muted-foreground">{project.description}</p>
        )}
      </div>

        <IssueTable
          issues={project.issues || []}
          onIssueClick={handleIssueClick}
        />
      
      <IssueDialog
        issueId={selectedIssueId}
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
      />
    </div>
  );
}
