import type { Sprint } from "@/types";
import { cookies } from "./auth";

const API_URL = import.meta.env.VITE_API_URL + "/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${cookies.get("auth_token")}`,
});

export const sprintService = {
  async getActive(): Promise<Sprint> {
    const response = await fetch(`${API_URL}/sprints`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Impossible de récupérer le sprint actif");
    }

    return response.json();
  },

  async getAll(): Promise<Sprint[]> {
    const response = await fetch(`${API_URL}/sprints/all`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Impossible de récupérer les sprints");
    }

    return response.json();
  },
};

export default sprintService;
