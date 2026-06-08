import { useEffect, useState, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { teamService } from '@/services/team';
import type { Team } from '@/types/team';
import { useAuth } from './useAuth';
import { TeamPreferenceContext } from './team-preference-context';
import { UsersRound } from 'lucide-react';

const STORAGE_KEY = 'jira-mini:team';

function readStoredId(): number | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return isNaN(parsed) ? null : parsed;
}

export function TeamPreferenceProvider({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamIdState] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    teamService.getAll(logout).then((loaded) => {
      setTeams(loaded);
      if (loaded.length === 0) {
        setIsLoading(false);
        return;
      }
      const stored = readStoredId();
      const valid = stored !== null && loaded.some((t) => t.id === stored);
      if (valid) {
        setSelectedTeamIdState(stored);
        setIsLoading(false);
      } else if (loaded.length === 1) {
        // Single team — auto-select silently
        const id = loaded[0].id;
        localStorage.setItem(STORAGE_KEY, String(id));
        setSelectedTeamIdState(id);
        setIsLoading(false);
      } else {
        // Multiple teams, no stored preference — prompt user
        setIsLoading(false);
        setShowPicker(true);
      }
    });
  }, [logout]);

  const setSelectedTeamId = (id: number) => {
    localStorage.setItem(STORAGE_KEY, String(id));
    setSelectedTeamIdState(id);
  };

  const handlePickTeam = (id: number) => {
    setSelectedTeamId(id);
    setShowPicker(false);
  };

  return (
    <TeamPreferenceContext.Provider value={{ teams, selectedTeamId, setSelectedTeamId, isLoading }}>
      {children}

      <Dialog
        open={showPicker}
        onOpenChange={(open) => {
          if (!open && teams.length > 0) handlePickTeam(teams[0].id);
        }}
      >
        <DialogContent className="sm:max-w-lg" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Choisissez votre équipe par défaut</DialogTitle>
            <DialogDescription>
              Vous pouvez changer cette préférence à tout moment depuis la barre de navigation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 pt-2 max-h-96 overflow-y-auto">
            {teams.map((team) => (
              <Button
                key={team.id}
                variant="outline"
                className="flex flex-col items-center justify-center gap-3 h-auto min-h-28 p-5 rounded-xl border-2 hover:border-primary/40 hover:bg-primary/5 whitespace-normal"
                onClick={() => handlePickTeam(team.id)}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                  <UsersRound className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center min-w-0 w-full">
                  <p className="font-semibold text-sm truncate">{team.name}</p>
                  {team.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 wrap-break-word">{team.description}</p>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </TeamPreferenceContext.Provider>
  );
}
