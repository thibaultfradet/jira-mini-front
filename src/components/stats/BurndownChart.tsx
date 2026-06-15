import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DailyDataPoint } from '@/types/custom/stats';
import { Skeleton } from '@/components/ui/skeleton';
import { getWeekendBands } from './weekendBands';
import { WeekendBackground } from './WeekendBackground';
import { withWeekendFlatIdeal } from './burndownIdeal';

interface BurndownChartProps {
  data: DailyDataPoint[];
  isLoading: boolean;
  totalPoints: number;
  startDate: string;
  endDate: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

const LABELS: Record<string, string> = {
  remainingPoints: 'Travail restant',
  idealRemaining: 'Ligne idéale',
};

export function BurndownChart({ data, isLoading, totalPoints, startDate, endDate }: BurndownChartProps) {
  if (isLoading) {
    return <Skeleton className="h-130 w-full rounded-lg" />;
  }

  if (data.length === 0) {
    return (
      <div className="h-130 flex items-center justify-center text-muted-foreground text-sm">
        Aucune donnée disponible pour ce sprint.
      </div>
    );
  }

  const chartData = withWeekendFlatIdeal(data, totalPoints, startDate, endDate).map((d) => ({
    ...d,
    date: formatDate(d.date),
  }));
  const weekendBands = getWeekendBands(data);

  return (
    <ResponsiveContainer width="100%" height={520}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <WeekendBackground bands={weekendBands} />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis
          domain={[0, totalPoints + Math.ceil(totalPoints * 0.1)]}
          tick={{ fontSize: 12 }}
          label={{ value: 'Story Points', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11 } }}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="rounded-lg border bg-white px-3 py-2 shadow-md text-xs space-y-1">
                <p className="font-medium text-foreground">{label}</p>
                {payload.map((entry) => (
                  <p key={String(entry.dataKey)} style={{ color: entry.color }}>
                    {LABELS[String(entry.dataKey)] ?? entry.dataKey} : {entry.value} SP
                  </p>
                ))}
              </div>
            );
          }}
        />
        <Legend align="center" formatter={(value) => LABELS[value] ?? value} />
        <Line
          type="stepAfter"
          dataKey="remainingPoints"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          connectNulls
        />
        <Line
          type="linear"
          dataKey="idealRemaining"
          stroke="#94a3b8"
          strokeWidth={1.5}
          strokeDasharray="6 3"
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
