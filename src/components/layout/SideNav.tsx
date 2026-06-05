import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { projectService } from '@/services/project';
import { teamService } from '@/services/team';
import type { Project } from '@/types/project';
import type { Team } from '@/types/team';
import { LayoutDashboard, Zap, FolderKanban, Search, Users, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/useAuth';

export default function SideNav() {
  const location = useLocation();
  const { logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([projectService.getAll(logout), teamService.getAll(logout)]).then(([p, t]) => {
      setProjects(p);
      setTeams(t);
      setSelectedTeamId((current) => (current === null && t.length > 0 ? t[0].id : current));
      setIsLoading(false);
    });
  }, [logout]);

  const displayedProjects = projects.slice(0, 5);
  const filteredProjects = projects.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const isActive = (path: string) => location.pathname === path;
  const isPrefix = (prefix: string) => location.pathname.startsWith(prefix);

  return (
    <>
      <aside className="w-64 border-r bg-white h-full flex flex-col overflow-y-auto">
        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive('/') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>

          <Link
            to="/backlog"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive('/backlog') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <ListChecks className="h-5 w-5" />
            Backlog
          </Link>

          {/* Team selector + active sprint */}
          {teams.length > 0 && (
            <>
              <Separator className="my-2" />
              <div className="px-3 py-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Équipe</p>
                <select
                  value={selectedTeamId ?? ''}
                  onChange={(e) => setSelectedTeamId(Number(e.target.value))}
                  className="w-full text-sm border rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              {selectedTeamId && (
                <Link
                  to={`/teams/${selectedTeamId}/sprint`}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isPrefix('/teams') && isPrefix('/sprint') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Zap className="h-5 w-5" />
                  Sprint actif
                </Link>
              )}
            </>
          )}

          <Separator className="my-4" />

          {/* Projects section */}
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Projets</p>

            {isLoading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">Chargement...</div>
            ) : displayedProjects.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">Aucun projet</div>
            ) : (
              displayedProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive(`/projects/${project.id}`) ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <FolderKanban className="h-4 w-4 shrink-0" />
                  <span className="truncate">{project.name}</span>
                </Link>
              ))
            )}

            {projects.length > 5 && (
              <button
                onClick={() => setIsDialogOpen(true)}
                className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-primary hover:bg-primary/10 transition-colors cursor-pointer"
              >
                <Search className="h-4 w-4" />
                Voir plus ({projects.length})
              </button>
            )}
          </div>

          {/* Members link for quick access */}
          {selectedTeamId && (
            <>
              <Separator className="my-4" />
              <Link
                to={`/teams/${selectedTeamId}/members`}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isPrefix('/teams') && isPrefix('/members') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Users className="h-5 w-5" />
                Membres
              </Link>
            </>
          )}
        </nav>
      </aside>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rechercher un projet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nom du projet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun projet trouvé</p>
              ) : (
                filteredProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    onClick={() => { setIsDialogOpen(false); setSearchQuery(''); }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
                  >
                    <FolderKanban className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{project.name}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
