import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingDown, TrendingUp, BarChart3 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

type ChartType = 'burndown' | 'burnup' | 'velocity';

const CHART_META: Record<ChartType, { title: string; description: string; icon: React.ElementType }> = {
  burndown: {
    title: 'Burndown Chart',
    description: 'Story points restants jour par jour — idéalement la courbe descend vers zéro.',
    icon: TrendingDown,
  },
  burnup: {
    title: 'Burnup Chart',
    description: 'Travail complété qui monte progressivement vers le périmètre total du sprint.',
    icon: TrendingUp,
  },
  velocity: {
    title: 'Vélocité',
    description: "Story points complétés par sprint — mesure la capacité et la régularité de l'équipe.",
    icon: BarChart3,
  },
};

function isValidChartType(type: string): type is ChartType {
  return type in CHART_META;
}

export default function StatsChart() {
  const { chartType } = useParams<{ chartType: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { selectedTeamId: preferredTeamId } = useTeamPreference();

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null);

  const [sprintStats, setSprintStats] = useState<SprintStatsData | null>(null);
  const [velocityData, setVelocityData] = useState<VelocitySprint[]>([]);

  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingSprints, setLoadingSprints] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingVelocity, setLoadingVelocity] = useState(false);

  const isSprintChart = chartType === 'burndown' || chartType === 'burnup';

  useEffect(() => {
    if (!chartType || !isValidChartType(chartType)) {
      navigate('/stats', { replace: true });
    }
  }, [chartType, navigate]);

  useEffect(() => {
    fetchWithRefresh(logout, `${import.meta.env.VITE_API_URL}/api/teams`)
      .then((data) => {
        const result = (data.success ? (data.data as Team[]) : null) ?? [];
        setTeams(result);
        setLoadingTeams(false);
        if (result.length > 0) {
          const preferred = result.find((t) => t.id === preferredTeamId);
          const teamId = preferred ? preferred.id : result[0].id;
          if (chartType === 'burndown' || chartType === 'burnup') setLoadingSprints(true);
          else setLoadingVelocity(true);
          setSelectedTeamId(teamId);
        }
      })
      .catch(() => setLoadingTeams(false));
  }, [logout, preferredTeamId, chartType]);

  useEffect(() => {
    if (!selectedTeamId) return;

    if (isSprintChart) {
      sprintService.getAll(logout, selectedTeamId).then((allSprints) => {
        const relevant = allSprints
          .filter((s) => s.status === 'active' || s.status === 'completed')
          .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
        setSprints(relevant);
        setLoadingSprints(false);
        const active = relevant.find((s) => s.status === 'active');
        const defaultSprint = active ?? relevant[0] ?? null;
        if (defaultSprint) {
          setLoadingStats(true);
          setSelectedSprintId(defaultSprint.id);
        } else {
          setSelectedSprintId(null);
        }
      });
    } else {
      statsService.getVelocity(logout, selectedTeamId).then((velocity) => {
        setVelocityData(velocity);
        setLoadingVelocity(false);
      });
    }
  }, [selectedTeamId, isSprintChart, logout]);

  useEffect(() => {
    if (!selectedSprintId || !isSprintChart) return;
    statsService.getSprintStats(logout, selectedSprintId).then((stats) => {
      setSprintStats(stats);
      setLoadingStats(false);
    });
  }, [selectedSprintId, isSprintChart, logout]);

  if (!chartType || !isValidChartType(chartType)) return null;

  const meta = CHART_META[chartType];
  const Icon = meta.icon;
  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => navigate('/stats')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Statistiques
      </button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{meta.title}</h1>
          <p className="text-sm text-muted-foreground">{meta.description}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Équipe</span>
          <Select
            value={selectedTeamId?.toString() ?? ''}
            onValueChange={(v) => {
              const newTeamId = Number(v);
              setSelectedTeamId(newTeamId);
              setSprintStats(null);
              setVelocityData([]);
              setSelectedSprintId(null);
              setSprints([]);
              if (isSprintChart) setLoadingSprints(true);
              else setLoadingVelocity(true);
            }}
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

        {isSprintChart && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Sprint</span>
            <Select
              value={selectedSprintId?.toString() ?? ''}
              onValueChange={(v) => {
                setSelectedSprintId(Number(v));
                setLoadingStats(true);
                setSprintStats(null);
              }}
              disabled={loadingSprints || sprints.length === 0}
            >
              <SelectTrigger className="w-44 text-xs">
                <SelectValue placeholder={loadingSprints ? 'Chargement…' : 'Aucun sprint'} />
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
        )}

      </div>

      {/* Chart */}
      <div className="w-full">
        {chartType === 'burndown' && (
          <>
            {!selectedTeamId ? (
              <EmptyState message="Sélectionnez une équipe pour afficher le burndown." />
            ) : (
              <BurndownChart
                data={sprintStats?.dailyData ?? []}
                totalPoints={sprintStats?.totalPoints ?? 0}
                startDate={sprintStats?.sprint.startDate ?? ''}
                endDate={sprintStats?.sprint.endDate ?? ''}
                isLoading={loadingStats || loadingSprints}
              />
            )}
            {sprintStats && <IssueBreakdown breakdown={sprintStats.issueBreakdown} />}
          </>
        )}

        {chartType === 'burnup' && (
          <>
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
          </>
        )}

        {chartType === 'velocity' && (
          <>
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
                {selectedTeam && (
                  <span>
                    {' '}
                    — équipe <span className="font-medium text-foreground">{selectedTeam.name}</span>
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
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
