import axios from "axios";

function normalizeBaseUrl(input: string): string {
  // Trim whitespace and remove trailing slashes for stable joining behavior.
  return input.trim().replace(/\/+$/, "");
}

// If unset, use same-origin (works with Vite proxy in dev, or same-domain deployments).
const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL ?? "");

export const api = axios.create({
  baseURL: API_BASE_URL || undefined
});

// If a user sets VITE_API_BASE_URL to ".../api" and we also request "/api/...",
// Axios would call ".../api/api/...". This normalizes requests so either style works.
api.interceptors.request.use((config) => {
  const baseURL = normalizeBaseUrl(String(config.baseURL ?? ""));
  const url = String(config.url ?? "");

  const baseEndsWithApi = /\/api$/.test(baseURL);
  const urlStartsWithApi = /^\/api(\/|$)/.test(url);

  if (baseEndsWithApi && urlStartsWithApi) {
    config.url = url.replace(/^\/api/, "") || "/";
  }
  return config;
});

export type ApiErrorShape = {
  error?: { message?: string; details?: unknown };
};

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiErrorShape | undefined;
    return data?.error?.message || err.message || "Request failed";
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}


