import type { Sprint } from '@/types/sprint';
import { fetchWithRefresh } from '@/utils/fetchWithRefresh';
import { showErrorToast, showSuccessToast } from '@/utils/toastHelpers';

const BASE = `${import.meta.env.VITE_API_URL}/api/sprints`;

export const sprintService = {
  async getAll(logout: () => void, teamId?: number): Promise<Sprint[]> {
    try {
      const url = teamId ? `${BASE}?teamId=${teamId}` : BASE;
      const data = await fetchWithRefresh(logout, url);
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return (data.data as Sprint[]) ?? [];
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Impossible de charger les sprints');
      return [];
    }
  },

  async getActive(logout: () => void, teamId: number): Promise<Sprint | null> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/active?teamId=${teamId}`);
      if (!data.success) return null;
      return data.data as Sprint;
    } catch {
      return null;
    }
  },

  async getById(logout: () => void, id: number): Promise<Sprint | null> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${id}`);
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return data.data as Sprint;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Sprint non trouvé');
      return null;
    }
  },

  async create(
    logout: () => void,
    payload: { name: string; teamId: number; startDate?: string; endDate?: string; goal?: string },
  ): Promise<Sprint | null> {
    try {
      const data = await fetchWithRefresh(logout, BASE, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      showSuccessToast('Sprint créé');
      return data.data as Sprint;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Impossible de créer le sprint');
      return null;
    }
  },

  async update(
    logout: () => void,
    id: number,
    payload: { name?: string; startDate?: string; endDate?: string; goal?: string },
  ): Promise<Sprint | null> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return data.data as Sprint;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Impossible de mettre à jour le sprint');
      return null;
    }
  },

  async start(logout: () => void, id: number): Promise<Sprint | null> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${id}/start`, { method: 'POST' });
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      showSuccessToast('Sprint démarré');
      return data.data as Sprint;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Impossible de démarrer le sprint');
      return null;
    }
  },

  async complete(
    logout: () => void,
    id: number,
    moveToNextSprint: boolean,
  ): Promise<{ sprint: Sprint; moved: number; backlogged: number } | null> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${id}/complete`, {
        method: 'POST',
        body: JSON.stringify({ moveToNextSprint }),
      });
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      showSuccessToast('Sprint terminé');
      return data.data as { sprint: Sprint; moved: number; backlogged: number };
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Impossible de terminer le sprint');
      return null;
    }
  },

  async delete(logout: () => void, id: number): Promise<boolean> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${id}`, { method: 'DELETE' });
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return true;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Impossible de supprimer le sprint');
      return false;
    }
  },

  async addIssue(logout: () => void, sprintId: number, issueId: number): Promise<boolean> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${sprintId}/issues`, {
        method: 'POST',
        body: JSON.stringify({ issueId }),
      });
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return true;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Impossible d'ajouter la tâche au sprint");
      return false;
    }
  },

  async removeIssue(logout: () => void, sprintId: number, issueId: number): Promise<boolean> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${sprintId}/issues/${issueId}`, {
        method: 'DELETE',
      });
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return true;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Impossible de retirer la tâche du sprint');
      return false;
    }
  },
};

export default sprintService;
