import type { Project } from "@/types";
import { cookies } from "./auth";

const API_URL = import.meta.env.VITE_API_URL + "/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${cookies.get("auth_token")}`,
});

export const projectService = {
  async getAll(): Promise<Project[]> {
    const response = await fetch(`${API_URL}/projects`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Impossible de récupérer les projets");
    }

    return response.json();
  },

  async getById(id: number): Promise<Project> {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Projet non trouvé");
    }

    return response.json();
  },

  async create(data: { name: string; description: string }): Promise<Project> {
    const response = await fetch(`${API_URL}/projects`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Impossible de créer le projet");
    }

    return response.json();
  },

  async update(
    id: number,
    data: { name?: string; description?: string }
  ): Promise<Project> {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Impossible de mettre à jour le projet");
    }

    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Impossible de supprimer le projet");
    }
  },
};

export default projectService;
