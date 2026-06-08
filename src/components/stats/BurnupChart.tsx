import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { DailyDataPoint } from '@/types/custom/stats';
import { Skeleton } from '@/components/ui/skeleton';

interface BurnupChartProps {
  data: DailyDataPoint[];
  isLoading: boolean;
  totalPoints: number;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

export function BurnupChart({ data, isLoading, totalPoints }: BurnupChartProps) {
  if (isLoading) {
    return <Skeleton className="h-72 w-full rounded-lg" />;
  }

  if (data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
        Aucune donnée disponible pour ce sprint.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    date: formatDate(d.date),
    scope: totalPoints,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis
          domain={[0, totalPoints + Math.ceil(totalPoints * 0.1)]}
          tick={{ fontSize: 12 }}
          label={{ value: 'Story Points', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11 } }}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const labels: Record<string, string> = {
              completedPoints: 'Travail complété',
              scope: 'Périmètre (Work scope)',
              idealCompleted: 'Guideline (idéal)',
            };
            return (
              <div className="rounded-lg border bg-white px-3 py-2 shadow-md text-xs space-y-1">
                <p className="font-medium text-foreground">{label}</p>
                {payload.map((entry) => (
                  <p key={String(entry.dataKey)} style={{ color: entry.color }}>
                    {labels[String(entry.dataKey)] ?? entry.dataKey} : {entry.value} SP
                  </p>
                ))}
              </div>
            );
          }}
        />
        <Legend
          formatter={(value) => {
            const labels: Record<string, string> = {
              completedPoints: 'Travail complété',
              scope: 'Périmètre (Work scope)',
              idealCompleted: 'Guideline (idéal)',
            };
            return labels[value] ?? value;
          }}
        />
        <ReferenceLine y={totalPoints} stroke="#ef4444" strokeDasharray="4 4" />
        <Line
          type="linear"
          dataKey="scope"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
          legendType="line"
        />
        <Line
          type="linear"
          dataKey="idealCompleted"
          stroke="#94a3b8"
          strokeWidth={1.5}
          strokeDasharray="6 3"
          dot={false}
        />
        <Line
          type="stepAfter"
          dataKey="completedPoints"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
