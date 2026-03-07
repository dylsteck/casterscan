import { NextRequest } from "next/server";
import { apiFetch } from "@/app/lib/api";
import { CACHE_TTLS } from "@/app/lib/utils";
import { validateFid } from "@/app/lib/validate";

export async function GET(request: NextRequest) {
  const fid = request.nextUrl.searchParams.get("fid");

  if (!validateFid(fid)) {
    return Response.json({ error: "FID parameter required or invalid" }, { status: 400 });
  }

  const data = await apiFetch(`/v1/fids/${fid}/signers/enriched`);
  return Response.json(data, {
    headers: { "Cache-Control": `max-age=${CACHE_TTLS.LONG}` },
  });
}
