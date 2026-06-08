import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { projectService } from '@/services/project';
import { useAuth } from '@/contexts/useAuth';
import type { Project as ProjectType } from '@/types/project';
import type { Issue } from '@/types/issue';
import { IssueTable } from '@/components/issue-table';
import IssueDialog from './project/IssueDialog';

export default function Project() {
  const { id } = useParams();
  const { logout } = useAuth();
  const [project, setProject] = useState<ProjectType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    projectService.getById(logout, Number(id)).then((data) => {
      if (!data) setError('Projet non trouvé');
      else setProject(data);
      setIsLoading(false);
    });
  }, [logout, id]);

  const handleIssueClick = (issue: Issue) => {
    if (issue.type !== 'epic') {
      setSelectedIssueId(issue.id);
      setIsDialogOpen(true);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setSelectedIssueId(null);
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
        <span className="text-red-500">{error || 'Projet non trouvé'}</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">{project.name}</h1>
        {project.description && <p className="text-muted-foreground">{project.description}</p>}
      </div>

      <IssueTable issues={project.issues ?? []} onIssueClick={handleIssueClick} />

      <IssueDialog issueId={selectedIssueId} open={isDialogOpen} onOpenChange={handleDialogClose} />
    </div>
  );
}
