const DATA_LAYER_URL = process.env.DATA_LAYER_URL || "http://localhost:4000";

export async function dataLayerFetch<T>(path: string): Promise<T> {
  const url = `${DATA_LAYER_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Data layer error ${res.status}: ${text}`);
  }
  return res.json();
}
