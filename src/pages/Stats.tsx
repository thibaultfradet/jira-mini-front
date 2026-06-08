import { useCallback, useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BurndownChart } from '@/components/stats/BurndownChart';
import { BurnupChart } from '@/components/stats/BurnupChart';
import { VelocityChart } from '@/components/stats/VelocityChart';
import { fetchWithRefresh } from '@/utils/fetchWithRefresh';
import { sprintService } from '@/services/sprint';
import { statsService } from '@/services/stats';
import { useAuth } from '@/contexts/useAuth';
import { useTeamPreference } from '@/contexts/useTeamPreference';
import type { Team } from '@/types/team';
import type { Sprint } from '@/types/sprint';
import type { SprintStatsData, VelocitySprint } from '@/types/custom/stats';

export default function Stats() {
  const { logout } = useAuth();
  const { selectedTeamId: preferredTeamId } = useTeamPreference();

  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeamsOnly, setMyTeamsOnly] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null);

  const [sprintStats, setSprintStats] = useState<SprintStatsData | null>(null);
  const [velocityData, setVelocityData] = useState<VelocitySprint[]>([]);

  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingSprints, setLoadingSprints] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingVelocity, setLoadingVelocity] = useState(false);

  const loadTeamsFiltered = useCallback(
    async (myOnly: boolean) => {
      setLoadingTeams(true);
      try {
        const BASE = `${import.meta.env.VITE_API_URL}/api/teams`;
        const url = myOnly ? `${BASE}?myTeams=1` : BASE;
        const data = await fetchWithRefresh(logout, url);
        const result = data.success ? ((data.data as Team[]) ?? []) : [];
        setTeams(result);
        setLoadingTeams(false);
        return result;
      } catch {
        setLoadingTeams(false);
        return [];
      }
    },
    [logout],
  );

  // Load sprints for selected team (last 5 completed or active)
  const loadSprints = useCallback(
    async (teamId: number) => {
      setLoadingSprints(true);
      const allSprints = await sprintService.getAll(logout, teamId);
      const relevant = allSprints
        .filter((s) => s.status === 'active' || s.status === 'completed')
        .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
        .slice(0, 5);
      setSprints(relevant);
      setLoadingSprints(false);
      return relevant;
    },
    [logout],
  );

  // Load sprint stats
  const loadStats = useCallback(
    async (sprintId: number) => {
      setLoadingStats(true);
      const stats = await statsService.getSprintStats(logout, sprintId);
      setSprintStats(stats);
      setLoadingStats(false);
    },
    [logout],
  );

  // Load velocity data
  const loadVelocity = useCallback(
    async (teamId: number) => {
      setLoadingVelocity(true);
      const velocity = await statsService.getVelocity(logout, teamId);
      setVelocityData(velocity);
      setLoadingVelocity(false);
    },
    [logout],
  );

  // Initial load — prefer global team preference, fallback to first team
  useEffect(() => {
    loadTeamsFiltered(false).then((loadedTeams) => {
      if (loadedTeams.length > 0) {
        const preferred = loadedTeams.find((t) => t.id === preferredTeamId);
        setSelectedTeamId(preferred ? preferred.id : loadedTeams[0].id);
      }
    });
  }, [loadTeamsFiltered, preferredTeamId]);

  // When team changes, load its sprints and velocity
  useEffect(() => {
    if (!selectedTeamId) return;
    setSprintStats(null);
    setVelocityData([]);
    setSelectedSprintId(null);

    loadSprints(selectedTeamId).then((loadedSprints) => {
      // Default: active sprint, or most recent completed
      const active = loadedSprints.find((s) => s.status === 'active');
      const defaultSprint = active ?? loadedSprints[0] ?? null;
      if (defaultSprint) {
        setSelectedSprintId(defaultSprint.id);
      }
    });
    loadVelocity(selectedTeamId);
  }, [selectedTeamId, loadSprints, loadVelocity]);

  // When sprint changes, load stats
  useEffect(() => {
    if (!selectedSprintId) return;
    loadStats(selectedSprintId);
  }, [selectedSprintId, loadStats]);

  // Toggle "my teams only"
  const handleMyTeamsToggle = () => {
    const next = !myTeamsOnly;
    setMyTeamsOnly(next);
    loadTeamsFiltered(next).then((loadedTeams) => {
      if (loadedTeams.length > 0) {
        const preferred = loadedTeams.find((t) => t.id === preferredTeamId);
        setSelectedTeamId(preferred ? preferred.id : loadedTeams[0].id);
      } else {
        setSelectedTeamId(null);
        setSprints([]);
        setSprintStats(null);
        setVelocityData([]);
      }
    });
  };

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Statistiques</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Burndown, burnup et vélocité par sprint et par équipe.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Équipe</span>
              <Select
                value={selectedTeamId?.toString() ?? ''}
                onValueChange={(v) => setSelectedTeamId(Number(v))}
                disabled={loadingTeams || teams.length === 0}
              >
                <SelectTrigger className="w-52">
                  <SelectValue placeholder={loadingTeams ? 'Chargement…' : 'Sélectionner une équipe'} />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end pb-0.5">
              <Button
                variant={myTeamsOnly ? 'default' : 'outline'}
                size="sm"
                onClick={handleMyTeamsToggle}
                className="text-xs h-9 mt-5"
              >
                Mon équipe uniquement
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Tabs defaultValue="burndown">
        <TabsList className="mb-4">
          <TabsTrigger value="burndown">Burndown</TabsTrigger>
          <TabsTrigger value="burnup">Burnup</TabsTrigger>
          <TabsTrigger value="velocity">Vélocité</TabsTrigger>
        </TabsList>

        {/* Burndown */}
        <TabsContent value="burndown">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Burndown Chart</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Story points restants jour par jour — idéalement la courbe rouge descend vers zéro.
                  </CardDescription>
                </div>
                <SprintSelector
                  sprints={sprints}
                  value={selectedSprintId}
                  onChange={setSelectedSprintId}
                  loading={loadingSprints}
                />
              </div>
            </CardHeader>
            <CardContent>
              {!selectedTeamId ? (
                <EmptyState message="Sélectionnez une équipe pour afficher le burndown." />
              ) : (
                <BurndownChart
                  data={sprintStats?.dailyData ?? []}
                  totalPoints={sprintStats?.totalPoints ?? 0}
                  isLoading={loadingStats || loadingSprints}
                />
              )}
              {sprintStats && <IssueBreakdown breakdown={sprintStats.issueBreakdown} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Burnup */}
        <TabsContent value="burnup">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Burnup Chart</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Travail complété (vert) qui monte vers le périmètre total (rouge).
                  </CardDescription>
                </div>
                <SprintSelector
                  sprints={sprints}
                  value={selectedSprintId}
                  onChange={setSelectedSprintId}
                  loading={loadingSprints}
                />
              </div>
            </CardHeader>
            <CardContent>
              {!selectedTeamId ? (
                <EmptyState message="Sélectionnez une équipe pour afficher le burnup." />
              ) : (
                <BurnupChart
                  data={sprintStats?.dailyData ?? []}
                  totalPoints={sprintStats?.totalPoints ?? 0}
                  isLoading={loadingStats || loadingSprints}
                />
              )}
              {sprintStats && <IssueBreakdown breakdown={sprintStats.issueBreakdown} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Velocity */}
        <TabsContent value="velocity">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Vélocité</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {selectedTeam
                  ? `5 derniers sprints de l'équipe "${selectedTeam.name}"`
                  : 'Sélectionnez une équipe pour afficher la vélocité.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VelocityChart data={velocityData} isLoading={loadingVelocity} />
              {velocityData.length > 0 && (
                <div className="mt-3 text-xs text-muted-foreground">
                  Moyenne :{' '}
                  <span className="font-medium text-foreground">
                    {Math.round(
                      velocityData.reduce((sum, s) => sum + s.completedPoints, 0) / velocityData.length,
                    )}{' '}
                    SP
                  </span>{' '}
                  complétés par sprint
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface SprintSelectorProps {
  sprints: Sprint[];
  value: number | null;
  onChange: (id: number) => void;
  loading: boolean;
}

function SprintSelector({ sprints, value, onChange, loading }: SprintSelectorProps) {
  return (
    <div className="flex flex-col gap-1 min-w-44">
      <span className="text-xs font-medium text-muted-foreground">Sprint</span>
      <Select
        value={value?.toString() ?? ''}
        onValueChange={(v) => onChange(Number(v))}
        disabled={loading || sprints.length === 0}
      >
        <SelectTrigger className="w-44 text-xs">
          <SelectValue placeholder={loading ? 'Chargement…' : 'Aucun sprint'} />
        </SelectTrigger>
        <SelectContent>
          {sprints.map((s) => (
            <SelectItem key={s.id} value={s.id.toString()} className="text-xs">
              <span className="flex items-center gap-2">
                {s.status === 'active' && (
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 shrink-0" />
                )}
                {s.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface IssueBreakdownProps {
  breakdown: { todo: number; in_progress: number; done: number };
}

function IssueBreakdown({ breakdown }: IssueBreakdownProps) {
  const total = breakdown.todo + breakdown.in_progress + breakdown.done;
  if (total === 0) return null;

  return (
    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">{total} tâches</span>
      <span className="flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full bg-slate-400" />
        À faire&nbsp;: {breakdown.todo}
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />
        En cours&nbsp;: {breakdown.in_progress}
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
        Terminé&nbsp;: {breakdown.done}
      </span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">{message}</div>
  );
}
