// Single source of truth for all environment-based URLs
// VITE_API_URL should be set to the full API base, e.g. "https://your-backend.onrender.com/api"

export const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

// Socket connects to the server root (without /api)
export const SOCKET_URL = API_BASE_URL.replace(/\/api$/, "");

// Debug: log in development
if (import.meta.env.DEV) {
  console.log("[Config] API_BASE_URL:", API_BASE_URL);
  console.log("[Config] SOCKET_URL:", SOCKET_URL);
}
