import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

let accessToken = null;
let onAuthFail = null;

export function setAccessToken(token) {
  accessToken = token;
}
export function getAccessToken() {
  return accessToken;
}
export function setOnAuthFail(fn) {
  onAuthFail = fn;
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const status = err.response?.status;

    if (
      status === 401 &&
      !original._retry &&
      !original.url?.includes("/auth/login") &&
      !original.url?.includes("/auth/register") &&
      !original.url?.includes("/auth/refresh")
    ) {
      original._retry = true;
      try {
        if (!refreshing) {
          refreshing = axios.post(
            `${API_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );
        }
        const { data } = await refreshing;
        refreshing = null;
        const newToken = data?.data?.accessToken;
        if (newToken) {
          accessToken = newToken;
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }
      } catch (e) {
        refreshing = null;
        onAuthFail?.();
      }
    }
    return Promise.reject(err);
  }
);

export function getApiError(err, fallback = "Something went wrong") {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.errors?.[0]?.message ||
    err?.message ||
    fallback
  );
}
