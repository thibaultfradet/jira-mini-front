import type { Notification } from '@/types/notification';
import { fetchWithRefresh } from '@/utils/fetchWithRefresh';
import { showErrorToast } from '@/utils/toastHelpers';

const BASE = `${import.meta.env.VITE_API_URL}/api/notifications`;

export const notificationService = {
  async getAll(logout: () => void): Promise<{ notifications: Notification[]; unreadCount: number }> {
    try {
      const data = await fetchWithRefresh(logout, BASE);
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return data.data as { notifications: Notification[]; unreadCount: number };
    } catch {
      return { notifications: [], unreadCount: 0 };
    }
  },

  async markRead(logout: () => void, id: number): Promise<boolean> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${id}/read`, { method: 'PATCH' });
      return data.success;
    } catch {
      showErrorToast('Impossible de marquer comme lu');
      return false;
    }
  },

  async markAllRead(logout: () => void): Promise<boolean> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/read-all`, { method: 'PATCH' });
      return data.success;
    } catch {
      showErrorToast('Impossible de marquer tout comme lu');
      return false;
    }
  },
};

export default notificationService;
