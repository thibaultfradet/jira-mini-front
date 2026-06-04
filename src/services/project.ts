import type { Project } from '@/types/project';
import { fetchWithRefresh } from '@/utils/fetchWithRefresh';
import { showErrorToast } from '@/utils/toastHelpers';

const BASE = `${import.meta.env.VITE_API_URL}/api/projects`;

export const projectService = {
  async getAll(logout: () => void): Promise<Project[]> {
    try {
      const data = await fetchWithRefresh(logout, BASE);
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return (data.data as Project[]) ?? [];
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Impossible de charger les projets');
      return [];
    }
  },

  async getById(logout: () => void, id: number): Promise<Project | null> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${id}`);
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return data.data as Project;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Projet non trouvé');
      return null;
    }
  },

  async create(logout: () => void, payload: { name: string; description?: string }): Promise<Project | null> {
    try {
      const data = await fetchWithRefresh(logout, BASE, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return data.data as Project;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Impossible de créer le projet');
      return null;
    }
  },

  async update(logout: () => void, id: number, payload: { name?: string; description?: string }): Promise<Project | null> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return data.data as Project;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Impossible de mettre à jour le projet');
      return null;
    }
  },

  async delete(logout: () => void, id: number): Promise<boolean> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${id}`, { method: 'DELETE' });
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return true;
    } catch {
      showErrorToast('Impossible de supprimer le projet');
      return false;
    }
  },
};

export default projectService;
