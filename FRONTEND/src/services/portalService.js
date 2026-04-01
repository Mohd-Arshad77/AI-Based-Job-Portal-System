import api from "./api.js";

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  logout: () => api.post("/auth/logout")
};

export const profileApi = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (payload) => api.put("/users/profile", payload),
  uploadResume: (formData) => api.post("/users/resume", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  parseResume: (formData) => api.post("/resume/parse", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  getRecommendedJobs: () => api.get("/users/recommended-jobs"),
  getRuns: () => api.get("/runs")
};

export const jobsApi = {
  list: () => api.get("/jobs"),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (payload) => api.post("/jobs", payload),
  update: (id, payload) => api.put(`/jobs/${id}`, payload),
  close: (id) => api.patch(`/jobs/${id}/close`)
};

export const applicationsApi = {
  apply: (jobId) => api.post(`/applications/${jobId}`),
  list: () => api.get("/applications"),
  updateStatus: (id, status) => api.patch(`/applications/${id}/status`, { status })
};
