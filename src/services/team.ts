import type { Team } from '@/types/team';
import { fetchWithRefresh } from '@/utils/fetchWithRefresh';
import { showErrorToast, showSuccessToast } from '@/utils/toastHelpers';

const BASE = `${import.meta.env.VITE_API_URL}/api/teams`;

export const teamService = {
  async getAll(logout: () => void): Promise<Team[]> {
    try {
      const data = await fetchWithRefresh(logout, BASE);
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return (data.data as Team[]) ?? [];
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Impossible de charger les équipes');
      return [];
    }
  },

  async getById(logout: () => void, id: number): Promise<Team | null> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${id}`);
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return data.data as Team;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Équipe non trouvée');
      return null;
    }
  },

  async create(logout: () => void, payload: { name: string; description?: string }): Promise<Team | null> {
    try {
      const data = await fetchWithRefresh(logout, BASE, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      showSuccessToast('Équipe créée');
      return data.data as Team;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Impossible de créer l'équipe");
      return null;
    }
  },

  async update(
    logout: () => void,
    id: number,
    payload: { name?: string; description?: string },
  ): Promise<Team | null> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return data.data as Team;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Impossible de mettre à jour l'équipe");
      return null;
    }
  },

  async delete(logout: () => void, id: number): Promise<boolean> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${id}`, { method: 'DELETE' });
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return true;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Impossible de supprimer l'équipe");
      return false;
    }
  },

  async addMember(logout: () => void, teamId: number, userId: number): Promise<boolean> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${teamId}/members`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      showSuccessToast('Membre ajouté');
      return true;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Impossible d'ajouter le membre");
      return false;
    }
  },

  async removeMember(logout: () => void, teamId: number, userId: number): Promise<boolean> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${teamId}/members/${userId}`, {
        method: 'DELETE',
      });
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      showSuccessToast('Membre retiré');
      return true;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Impossible de retirer le membre');
      return false;
    }
  },
};

export default teamService;
