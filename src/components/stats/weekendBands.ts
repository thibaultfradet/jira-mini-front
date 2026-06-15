import type { DailyDataPoint } from '@/types/custom/stats';

export interface WeekendBand {
  x1: string;
  x2: string;
}

/** Formate une date ISO en libellé d'axe court (jj/mm) — doit matcher l'axe X des charts. */
function formatLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

/**
 * Calcule les plages de week-end consécutives à griser en fond du graphique.
 * Retourne des paires de libellés d'axe (x1 → x2) prêtes pour <ReferenceArea>.
 */
export function getWeekendBands(data: DailyDataPoint[]): WeekendBand[] {
  const bands: WeekendBand[] = [];
  let start: string | null = null;
  let end: string | null = null;

  for (const point of data) {
    const day = new Date(point.date).getDay(); // 0 = dimanche, 6 = samedi
    const isWeekend = day === 0 || day === 6;
    const label = formatLabel(point.date);

    if (isWeekend) {
      if (start === null) start = label;
      end = label;
    } else if (start !== null && end !== null) {
      bands.push({ x1: start, x2: end });
      start = null;
      end = null;
    }
  }

  if (start !== null && end !== null) {
    bands.push({ x1: start, x2: end });
  }

  return bands;
}
