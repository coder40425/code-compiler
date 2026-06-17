import axios from "axios";

// Import Clerk's useAuth hook indirectly — we can't call hooks outside React,
// so we expose a setter that AuthContext calls once the token is available.
let _getToken: (() => Promise<string | null>) | null = null;

/**
 * Called once from AuthContext after Clerk loads.
 * Stores the getToken function so the Axios interceptor can use it.
 */
export function registerGetToken(fn: () => Promise<string | null>) {
  _getToken = fn;
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attaches Bearer token to every outgoing request
axiosInstance.interceptors.request.use(async (config) => {
  if (_getToken) {
    try {
      const token = await _getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // If token fetch fails, send request without auth header
      // (unauthenticated routes will still work; protected ones will 401)
    }
  }
  return config;
});

// Response interceptor — normalises error messages
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ??
      error.message ??
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;