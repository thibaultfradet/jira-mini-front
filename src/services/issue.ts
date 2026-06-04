import type { Issue } from '@/types/issue';
import type { Comment } from '@/types/comment';
import type { SubTask } from '@/types/subtask';
import { fetchWithRefresh } from '@/utils/fetchWithRefresh';
import { showErrorToast } from '@/utils/toastHelpers';

const BASE = `${import.meta.env.VITE_API_URL}/api/issues`;

export const issueService = {
  async getById(logout: () => void, id: number): Promise<Issue | null> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${id}`);
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return data.data as Issue;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Issue non trouvée');
      return null;
    }
  },

  async getChildren(logout: () => void, parentId: number): Promise<Issue[]> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${parentId}/children`);
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return (data.data as Issue[]) ?? [];
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Impossible de récupérer les sous-issues');
      return [];
    }
  },

  async getBacklog(logout: () => void): Promise<Issue[]> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/backlog`);
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return (data.data as Issue[]) ?? [];
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Impossible de charger le backlog');
      return [];
    }
  },

  async create(
    logout: () => void,
    payload: {
      title: string;
      type: string;
      description?: string;
      projectId?: number;
      parentId?: number;
      assigneeId?: number;
      storyPoints?: number;
      urgency?: string;
      deadline?: string;
    },
  ): Promise<Issue | null> {
    try {
      const data = await fetchWithRefresh(logout, BASE, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return data.data as Issue;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Impossible de créer la tâche');
      return null;
    }
  },

  async update(
    logout: () => void,
    id: number,
    payload: Partial<{
      title: string;
      description: string;
      status: string;
      urgency: string | null;
      deadline: string | null;
      assigneeId: number | null;
      storyPoints: number | null;
      sprintId: number | null;
    }>,
  ): Promise<Issue | null> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return data.data as Issue;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Impossible de mettre à jour la tâche');
      return null;
    }
  },

  async delete(logout: () => void, id: number): Promise<boolean> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${id}`, { method: 'DELETE' });
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return true;
    } catch {
      showErrorToast('Impossible de supprimer la tâche');
      return false;
    }
  },

  async getComments(logout: () => void, issueId: number): Promise<Comment[]> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${issueId}/comments`);
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return (data.data as Comment[]) ?? [];
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Impossible de charger les commentaires');
      return [];
    }
  },

  async addComment(logout: () => void, issueId: number, content: string): Promise<Comment | null> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${issueId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return data.data as Comment;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Impossible d'ajouter le commentaire");
      return null;
    }
  },

  async getSubTasks(logout: () => void, issueId: number): Promise<SubTask[]> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${issueId}/subtasks`);
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return (data.data as SubTask[]) ?? [];
    } catch {
      return [];
    }
  },

  async createSubTask(logout: () => void, issueId: number, title: string): Promise<SubTask | null> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${issueId}/subtasks`, {
        method: 'POST',
        body: JSON.stringify({ title }),
      });
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return data.data as SubTask;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Impossible d'ajouter la sous-tâche");
      return null;
    }
  },

  async updateSubTask(
    logout: () => void,
    issueId: number,
    subTaskId: number,
    payload: { isDone?: boolean; title?: string },
  ): Promise<SubTask | null> {
    try {
      const data = await fetchWithRefresh(logout, `${BASE}/${issueId}/subtasks/${subTaskId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (!data.success) throw new Error(data.message ?? 'Erreur');
      return data.data as SubTask;
    } catch {
      return null;
    }
  },
};

export default issueService;
