import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { projectService } from "@/services/project";
import type { Project } from "@/types";
import { LayoutDashboard, FolderKanban, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SideNav() {
  const location = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getAll();
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const displayedProjects = projects.slice(0, 5);
  const hasMoreProjects = projects.length > 5;

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <aside className="w-64 border-r bg-white h-full flex flex-col overflow-y-auto">
        <nav className="flex-1 p-4 space-y-1">
          {/* Dashboard */}
          <Link
            to="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("/")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>

          <Separator className="my-4" />

          {/* Projects section */}
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Projets
            </p>

            {isLoading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Chargement...
              </div>
            ) : displayedProjects.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Aucun projet
              </div>
            ) : (
              displayedProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive(`/projects/${project.id}`)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <FolderKanban className="h-4 w-4 shrink-0" />
                  <span className="truncate">{project.name}</span>
                </Link>
              ))
            )}

            {hasMoreProjects && (
              <button
                onClick={() => setIsDialogOpen(true)}
                className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-primary hover:bg-primary/10 transition-colors cursor-pointer"
              >
                <Search className="h-4 w-4" />
                Voir plus de projets
              </button>
            )}
          </div>
        </nav>
      </aside>

      {/* Dialog for searching all projects */}
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
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun projet trouvé
                </p>
              ) : (
                filteredProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    onClick={() => {
                      setIsDialogOpen(false);
                      setSearchQuery("");
                    }}
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
