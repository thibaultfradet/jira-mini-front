import type { SprintStatsData, VelocitySprint } from '@/types/custom/stats';
import { fetchWithRefresh } from '@/utils/fetchWithRefresh';
import { showErrorToast } from '@/utils/toastHelpers';

const BASE = `${import.meta.env.VITE_API_URL}/api/stats`;

export const statsService = {
  async getSprintStats(logout: () => void, sprintId: number): Promise<SprintStatsData | null> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/sprint/${sprintId}`);
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return data.data as SprintStatsData;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Impossible de charger les statistiques du sprint');
      return null;
    }
  },

  async getVelocity(logout: () => void, teamId: number, limit = 5): Promise<VelocitySprint[]> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/velocity?teamId=${teamId}&limit=${limit}`);
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return (data.data as VelocitySprint[]) ?? [];
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Impossible de charger la vélocité');
      return [];
    }
  },
};
