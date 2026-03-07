const DEFAULT_API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:4000"
    : "https://casterscan-api.vercel.app";

const API_URL = process.env.API_URL || DEFAULT_API_URL;

export async function apiFetch<T>(path: string): Promise<T> {
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}
