import type { DashboardData } from '@/types/custom/dashboard';
import { fetchWithRefresh } from '@/utils/fetchWithRefresh';

const BASE = `${import.meta.env.VITE_API_URL}/api/dashboard`;

export const dashboardService = {
  async getDashboard(logout: () => void): Promise<DashboardData | null> {
    try {
      const data = await fetchWithRefresh(logout, BASE);
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return data.data as DashboardData;
    } catch {
      return null;
    }
  },
};

export default dashboardService;
