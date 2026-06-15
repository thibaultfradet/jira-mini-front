export type ViewMode = 'table' | 'card';

// Préférence partagée entre les vues listables (utilisateurs, équipes…)
export const VIEW_STORAGE_KEY = 'jira-mini:users-view';

export function readStoredView(): ViewMode {
  return localStorage.getItem(VIEW_STORAGE_KEY) === 'card' ? 'card' : 'table';
}

export function storeView(mode: ViewMode): void {
  localStorage.setItem(VIEW_STORAGE_KEY, mode);
}
