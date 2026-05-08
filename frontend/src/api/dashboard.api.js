import { api } from "./client.js";

export const dashboardApi = {
  stats: () => api.get("/dashboard/stats").then((r) => r.data.data),
};
