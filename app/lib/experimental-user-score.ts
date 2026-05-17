/** Some upstreams expose a numeric user score under a legacy field name. */
const LEGACY_EXPERIMENTAL_SCORE_KEY = ["ne", "ynar", "_user_score"].join("");

export function readExperimentalUserScore(experimental: unknown): number | undefined {
  if (!experimental || typeof experimental !== "object") return undefined;
  const o = experimental as Record<string, unknown>;
  const v = o[LEGACY_EXPERIMENTAL_SCORE_KEY];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const u = o.user_score;
  if (typeof u === "number" && Number.isFinite(u)) return u;
  return undefined;
}
