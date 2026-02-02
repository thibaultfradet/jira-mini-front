import type { User } from "@/types";
import { cookies } from "./auth";

const API_URL = import.meta.env.VITE_API_URL + "/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${cookies.get("auth_token")}`,
});

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await fetch(`${API_URL}/users`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Impossible de récupérer les utilisateurs");
    }

    return response.json();
  },

  async getById(id: number): Promise<User> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Utilisateur non trouvé");
    }

    return response.json();
  },

  async update(
    id: number,
    data: { firstName?: string; lastName?: string; roles?: string[] }
  ): Promise<User> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Impossible de mettre à jour l'utilisateur");
    }

    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Impossible de supprimer l'utilisateur");
    }
  },

  async create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Impossible de créer l'utilisateur");
    }

    return response.json();
  },
};

export default userService;
