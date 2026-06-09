import { useNavigate } from 'react-router-dom';
import { TrendingDown, TrendingUp, BarChart3, ChevronRight } from 'lucide-react';

const CHARTS = [
  {
    type: 'burndown',
    title: 'Burndown Chart',
    description: 'Story points restants jour par jour — idéalement la courbe descend vers zéro.',
    icon: TrendingDown,
  },
  {
    type: 'burnup',
    title: 'Burnup Chart',
    description: 'Travail complété qui monte progressivement vers le périmètre total du sprint.',
    icon: TrendingUp,
  },
  {
    type: 'velocity',
    title: 'Vélocité',
    description: "Story points complétés par sprint — mesure la capacité et la régularité de l'équipe.",
    icon: BarChart3,
  },
];

export default function Stats() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Statistiques</h1>
        <p className="text-sm text-muted-foreground mt-1">Sélectionnez un rapport pour l'afficher.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CHARTS.map(({ type, title, description, icon: Icon }) => (
          <button
            key={type}
            onClick={() => navigate(`/stats/${type}`)}
            className="text-left flex flex-col gap-4 p-5 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
            </div>
            <div>
              <div className="font-medium text-sm">{title}</div>
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
