import { NextRequest } from "next/server";
import { apiFetch } from "@/app/lib/api";
import { CACHE_TTLS } from "@/app/lib/utils";
import { validateFid } from "@/app/lib/validate";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  const { fid } = await params;
  if (!validateFid(fid)) {
    return Response.json({ error: "Invalid fid" }, { status: 400 });
  }
  const data = await apiFetch<{
    casts: number;
    reactions: number;
    links: number;
    verifications: number;
  }>(`/v1/fids/${fid}/stats`);
  return Response.json(data, {
    headers: { "Cache-Control": `max-age=${CACHE_TTLS.FIFTEEN_MIN}` },
  });
}
