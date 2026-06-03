export function formatDate(date: string | null | undefined): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(date),
  );
}

export function formatDatetime(date: string | null | undefined): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function daysUntil(date: string | null | undefined): number | null {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export type DeadlineColor = 'green' | 'orange' | 'red';

export function getDeadlineColor(date: string | null | undefined): DeadlineColor | null {
  const days = daysUntil(date);
  if (days === null) return null;
  if (days > 7) return 'green';
  if (days >= 3) return 'orange';
  return 'red';
}

export function getDeadlineBadgeClass(date: string | null | undefined): string {
  const color = getDeadlineColor(date);
  if (!color) return '';
  return {
    green: 'bg-green-100 text-green-800',
    orange: 'bg-orange-100 text-orange-800',
    red: 'bg-red-100 text-red-800',
  }[color];
}
