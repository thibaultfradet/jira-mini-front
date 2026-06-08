import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { VelocitySprint } from '@/types/custom/stats';
import { Skeleton } from '@/components/ui/skeleton';

interface VelocityChartProps {
  data: VelocitySprint[];
  isLoading: boolean;
}

function shortName(name: string): string {
  return name.length > 14 ? name.slice(0, 12) + '…' : name;
}

export function VelocityChart({ data, isLoading }: VelocityChartProps) {
  if (isLoading) {
    return <Skeleton className="h-72 w-full rounded-lg" />;
  }

  if (data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
        Aucun sprint complété ou actif pour cette équipe.
      </div>
    );
  }

  const chartData = [...data].reverse().map((s) => ({
    name: shortName(s.sprintName),
    fullName: s.sprintName,
    committed: s.totalPoints,
    completed: s.completedPoints,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis
          tick={{ fontSize: 12 }}
          label={{ value: 'Story Points', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11 } }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const labels: Record<string, string> = {
              committed: 'Prévu',
              completed: 'Complété',
            };
            const fullName = payload[0]?.payload?.fullName ?? payload[0]?.payload?.name ?? '';
            return (
              <div className="rounded-lg border bg-white px-3 py-2 shadow-md text-xs space-y-1">
                <p className="font-medium text-foreground">{fullName}</p>
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
              committed: 'Prévu (Committed)',
              completed: 'Complété',
            };
            return labels[value] ?? value;
          }}
        />
        <Bar dataKey="committed" fill="#93c5fd" radius={[4, 4, 0, 0]} />
        <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
