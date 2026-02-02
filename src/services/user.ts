import type { User } from "@/types";
import { cookies } from "./auth";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${cookies.get("auth_token")}`,
});

export const userService = {
  async getMe(): Promise<User> {
    const response = await fetch(`${API_URL}/users/me`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Impossible de récupérer les informations utilisateur");
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
};

export default userService;
