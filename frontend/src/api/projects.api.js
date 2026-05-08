import { api } from "./client.js";

export const projectsApi = {
  list: (params) => api.get("/projects", { params }).then((r) => r.data.data.projects),
  get: (id) => api.get(`/projects/${id}`).then((r) => r.data.data.project),
  create: (payload) => api.post("/projects", payload).then((r) => r.data.data.project),
  update: (id, payload) => api.patch(`/projects/${id}`, payload).then((r) => r.data.data.project),
  remove: (id) => api.delete(`/projects/${id}`).then((r) => r.data),
};
