import type { DailyDataPoint } from '@/types/custom/stats';

function isWeekend(d: Date): boolean {
  const day = d.getDay(); // 0 = dimanche, 6 = samedi
  return day === 0 || day === 6;
}

/** Nombre de jours ouvrés (lun-ven) entre deux dates, bornes incluses. */
function countWorkingDays(start: Date, end: Date): number {
  let count = 0;
  const d = new Date(start);
  while (d <= end) {
    if (!isWeekend(d)) count += 1;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

/**
 * Recalcule la ligne idéale du burndown façon Jira : elle ne descend que les
 * jours ouvrés et reste PLATE le week-end. Part de totalPoints au début du
 * sprint et atteint 0 au dernier jour ouvré (la pente est calculée sur la durée
 * totale du sprint, pas seulement sur les jours visibles).
 *
 * Recalcul côté front pour ne pas toucher au backend ; retourne les mêmes points
 * que `data` avec uniquement `idealRemaining` réécrit.
 */
export function withWeekendFlatIdeal(
  data: DailyDataPoint[],
  totalPoints: number,
  sprintStartISO: string,
  sprintEndISO: string,
): DailyDataPoint[] {
  const start = new Date(sprintStartISO);
  start.setHours(0, 0, 0, 0);
  const end = new Date(sprintEndISO);
  end.setHours(0, 0, 0, 0);

  const totalWorkingDays = countWorkingDays(start, end);

  return data.map((point) => {
    const current = new Date(point.date);
    current.setHours(0, 0, 0, 0);
    const workingElapsed = countWorkingDays(start, current); // inclusif

    let idealRemaining: number;
    if (totalWorkingDays <= 1) {
      idealRemaining = workingElapsed >= 1 ? 0 : totalPoints;
    } else {
      const ratio = (workingElapsed - 1) / (totalWorkingDays - 1);
      idealRemaining = totalPoints * (1 - ratio);
    }
    idealRemaining = Math.max(0, Math.min(totalPoints, idealRemaining));

    return { ...point, idealRemaining: Math.round(idealRemaining) };
  });
}
