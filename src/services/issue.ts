import type { Issue } from "@/types";
import { cookies } from "./auth";

const API_URL = import.meta.env.VITE_API_URL + "/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${cookies.get("auth_token")}`,
});

export const issueService = {
  async getById(id: number): Promise<Issue> {
    const response = await fetch(`${API_URL}/issues/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Issue non trouvée");
    }

    return response.json();
  },

  async create(data: {
    title: string;
    description?: string;
    type: string;
    projectId?: number;
    parentId?: number;
  }): Promise<Issue> {
    const response = await fetch(`${API_URL}/issues`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Impossible de créer l'issue");
    }

    return response.json();
  },

  async update(
    id: number,
    data: Partial<{
      title: string;
      description: string;
      status: string;
      assigneeId: number | null;
      storyPoints: number | null;
    }>
  ): Promise<Issue> {
    const response = await fetch(`${API_URL}/issues/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Impossible de mettre à jour l'issue");
    }

    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/issues/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Impossible de supprimer l'issue");
    }
  },
};

export default issueService;
