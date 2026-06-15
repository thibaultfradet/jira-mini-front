import { usePlotArea, useXAxisScale, useXAxisTicks } from 'recharts';
import type { WeekendBand } from './weekendBands';

interface WeekendBackgroundProps {
  bands: WeekendBand[];
}

/**
 * Grise le fond des colonnes de week-end sur toute la hauteur du graphique,
 * façon Jira. Doit être rendu comme enfant d'un chart Recharts (utilise ses hooks).
 * Contrairement à <ReferenceArea>, couvre la colonne ENTIÈRE (et pas seulement
 * de centre à centre) en élargissant chaque plage d'un demi-pas de chaque côté.
 */
export function WeekendBackground({ bands }: WeekendBackgroundProps) {
  const plotArea = usePlotArea();
  const scale = useXAxisScale();
  const ticks = useXAxisTicks();

  if (!plotArea || !scale || !ticks || ticks.length < 2) return null;

  const step = Math.abs(ticks[1].coordinate - ticks[0].coordinate);
  const plotRight = plotArea.x + plotArea.width;

  return (
    <g>
      {bands.map((band) => {
        const c1 = scale(band.x1);
        const c2 = scale(band.x2);
        if (c1 == null || c2 == null) return null;

        const left = Math.max(Math.min(c1, c2) - step / 2, plotArea.x);
        const right = Math.min(Math.max(c1, c2) + step / 2, plotRight);
        const width = right - left;
        if (width <= 0) return null;

        return (
          <rect
            key={`${band.x1}-${band.x2}`}
            x={left}
            y={plotArea.y}
            width={width}
            height={plotArea.height}
            fill="#64748b"
            fillOpacity={0.1}
          />
        );
      })}
    </g>
  );
}
