import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE_URL
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


