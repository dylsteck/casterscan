const API_URL =
  process.env.API_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:4000" : undefined);

export async function apiFetch<T>(path: string): Promise<T> {
  if (!API_URL) {
    throw new Error("API_URL environment variable is required in production");
  }
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}
