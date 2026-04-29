import axios from "axios";
import { API_BASE_URL } from "../config.js";

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
  getProfile: () => api.get("/user/profile"),
  updateProfile: (payload) => api.put("/user/profile", payload),
  uploadResume: (formData) =>
    api.post("/user/upload-resume", formData, {
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
  inviteRecruiter: (data) => api.post("/admin/invite-recruiter", data),
  getUsers: () => api.get("/admin/users"),
  getRecruiters: () => api.get("/admin/recruiters"),
  toggleBlockUser: (id) => api.patch(`/admin/user/block/${id}`),
  deleteUser: (id) => api.delete(`/admin/user/${id}`),
  getJobs: () => api.get("/admin/jobs"),
  toggleBlockJob: (id) => api.patch(`/admin/job/block/${id}`),
  deleteJob: (id) => api.delete(`/admin/job/${id}`),
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
