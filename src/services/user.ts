import type { User } from '@/types/user';
import { fetchWithRefresh } from '@/utils/fetchWithRefresh';
import { showErrorToast } from '@/utils/toastHelpers';

const BASE = `${import.meta.env.VITE_API_URL}/api/users`;

export const userService = {
  async getAll(logout: () => void): Promise<User[]> {
    try {
      const data = await fetchWithRefresh(logout, BASE);
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return (data.data as User[]) ?? [];
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Impossible de charger les utilisateurs');
      return [];
    }
  },

  async getById(logout: () => void, id: number): Promise<User | null> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${id}`);
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return data.data as User;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Utilisateur non trouvé');
      return null;
    }
  },

  async getMe(logout: () => void): Promise<User | null> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/me`);
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return data.data as User;
    } catch {
      return null;
    }
  },

  async create(
    logout: () => void,
    payload: { email: string; firstName: string; lastName: string; isAdmin?: boolean },
  ): Promise<User | null> {
    try {
      const data = await fetchWithRefresh(logout, BASE, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return data.data as User;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Impossible de créer l'utilisateur");
      return null;
    }
  },

  async update(
    logout: () => void,
    id: number,
    payload: { firstName?: string; lastName?: string; email?: string; isAdmin?: boolean; isActive?: boolean; password?: string },
  ): Promise<User | null> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return data.data as User;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Impossible de mettre à jour l'utilisateur");
      return null;
    }
  },

  async delete(logout: () => void, id: number): Promise<boolean> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${id}`, { method: 'DELETE' });
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return true;
    } catch {
      showErrorToast("Impossible de supprimer l'utilisateur");
      return false;
    }
  },
};

export default userService;
