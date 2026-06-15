import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/UserAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { projectService } from '@/services/project';
import type { Project } from '@/types/project';
import { LayoutDashboard, Zap, FolderKanban, Search, ListChecks, BarChart2, User, LogOut, ChevronUp, UserCog, UsersRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/useAuth';
import { useTeamPreference } from '@/contexts/useTeamPreference';

export default function SideNav() {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const { selectedTeamId } = useTeamPreference();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    projectService.getAll(logout).then((p) => {
      setProjects(p);
      setIsLoading(false);
    });
  }, [logout]);

  const displayedProjects = projects.slice(0, 5);
  const filteredProjects = projects.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const isActive = (path: string) => location.pathname === path;
  const isPrefix = (prefix: string) => location.pathname.startsWith(prefix);

  return (
    <>
      <aside className="w-64 border-r bg-white h-full flex flex-col">
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          <Link
            to="/"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive('/') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          <Link
            to="/stats"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive('/stats') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <BarChart2 className="h-4 w-4" />
            Statistiques
          </Link>

          <Separator className="my-3" />

          <Link
            to="/backlog"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive('/backlog') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <ListChecks className="h-4 w-4" />
            Backlog
          </Link>

          {selectedTeamId && (
            <Link
              to={`/teams/${selectedTeamId}/sprint`}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isPrefix('/teams') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Zap className="h-4 w-4" />
              Sprint actif
            </Link>
          )}

          <Separator className="my-3" />

          {/* Projects */}
          <p className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Projets</p>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className="w-full justify-start gap-3 px-3 text-primary hover:text-primary hover:bg-primary/10"
            >
              <Search className="h-4 w-4" />
              Voir plus ({projects.length})
            </Button>
          )}

          {isAdmin && (
            <>
              <Separator className="my-3" />
              <p className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Administration</p>
              <Link
                to="/settings"
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive('/settings') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <UserCog className="h-4 w-4" />
                Utilisateurs
              </Link>
              <Link
                to="/settings/teams"
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive('/settings/teams') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <UsersRound className="h-4 w-4" />
                Équipes
              </Link>
              <Separator className="my-3" />
            </>
          )}
        </nav>

        {/* User profile — bottom */}
        <div className="border-t p-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer focus:outline-none group">
                <UserAvatar user={user} className="h-8 w-8 shrink-0" textClassName="text-xs font-medium" />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate leading-tight">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[11px] text-muted-foreground truncate leading-tight">
                    {user?.roles.includes('ROLE_ADMIN') ? 'Administrateur' : 'Utilisateur'}
                  </p>
                </div>
                <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-64 mb-1 p-0 overflow-hidden">
              {/* En-tête enrichi */}
              <div className="flex items-center gap-3 p-3 bg-muted/40">
                <UserAvatar user={user} className="h-10 w-10 shrink-0" textClassName="text-sm font-medium" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate leading-tight">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  <span
                    className={cn(
                      'inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded',
                      isAdmin ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {isAdmin ? 'Administrateur' : 'Utilisateur'}
                  </span>
                </div>
              </div>
              <DropdownMenuSeparator className="m-0" />
              <div className="p-1">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Mon profil
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <UserCog className="mr-2 h-4 w-4" />
                      Administration
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
