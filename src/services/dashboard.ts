import type { Project, Issue } from "@/types";
import { cookies } from "./auth";

const API_URL = import.meta.env.VITE_API_URL + "/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${cookies.get("auth_token")}`,
});

export interface DashboardResponse {
  projects: Project[];
  myTasks: {
    inProgress: Issue[];
    todo: Issue[];
  };
}

export const dashboardService = {
  async getDashboard(): Promise<DashboardResponse> {
    const response = await fetch(`${API_URL}/dashboard`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Impossible de récupérer le tableau de bord");
    }

    return response.json();
  },
};

export default dashboardService;
