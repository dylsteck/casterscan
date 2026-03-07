import { NextRequest } from "next/server";
import { apiFetch } from "@/app/lib/api";
import { CACHE_TTLS } from "@/app/lib/utils";
import { withAxiom } from "@/app/lib/axiom/server";

export const GET = withAxiom(async (request: NextRequest) => {
  const fid = request.nextUrl.searchParams.get("fid");

  if (!fid) {
    return Response.json({ error: "FID parameter required" }, { status: 400 });
  }

  const data = await apiFetch(`/v1/fids/${fid}/signers/enriched`);
  return Response.json(data, {
    headers: { "Cache-Control": `max-age=${CACHE_TTLS.LONG}` },
  });
});
