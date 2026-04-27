export const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

export const SOCKET_URL = API_BASE_URL.replace(/\/api$/, "");

if (import.meta.env.DEV) {
  console.log("[Config] API_BASE_URL:", API_BASE_URL);
  console.log("[Config] SOCKET_URL:", SOCKET_URL);
}
