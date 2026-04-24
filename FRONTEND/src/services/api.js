import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("portal_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  logout: () => api.post("/auth/logout"),
  googleAuth: (credential) => api.post("/auth/google", { credential }),
  verifyOtp: (payload) => api.post("/auth/verify-otp", payload)
};

export const profileApi = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (payload) => api.put("/users/profile", payload),
  uploadResume: (formData) =>
    api.post("/users/resume", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
  parseResume: (formData) =>
    api.post("/resume/parse", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
  getRecommendedJobs: () => api.get("/users/recommended-jobs")
};

export const jobsApi = {
  list: () => api.get("/jobs"),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (payload) => api.post("/jobs", payload),
  update: (id, payload) => api.put(`/jobs/${id}`, payload),
  close: (id) => api.patch(`/jobs/${id}/close`),
  setStatus: (id, isActive) =>
    api.patch(`/jobs/${id}/status`, { isActive })
};

export const applicationsApi = {
  apply: (jobId, formData) =>
    api.post(`/applications/${jobId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
  list: () => api.get("/applications"),
  updateStatus: (id, status) =>
    api.patch(`/applications/${id}/status`, { status })
};

export const interviewApi = {
  create: (payload) => api.post("/interviews", payload),
  list: () => api.get("/interviews")
};

export const adminApi = {
  getStats: () => api.get("/admin/stats"),
  inviteRecruiter: (data) =>
    api.post("/admin/invite-recruiter", data)
};

export const recruiterApi = {
  verifyAccount: (data) =>
    api.post("/auth/verify-recruiter", data)
};

export const notificationApi = {
  list: () => api.get("/notifications"),
  markAsRead: () => api.put("/notifications/read")
};

export default api;
