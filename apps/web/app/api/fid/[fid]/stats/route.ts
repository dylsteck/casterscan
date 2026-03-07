import { NextRequest } from "next/server";
import { dataLayerFetch } from "@/app/lib/data-layer";
import { CACHE_TTLS } from "@/app/lib/utils";
import { withAxiom } from "@/app/lib/axiom/server";

export const GET = withAxiom(async (
  _request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) => {
  const { fid } = await params;
  const data = await dataLayerFetch<{
    casts: number;
    reactions: number;
    links: number;
    verifications: number;
  }>(`/v1/fids/${fid}/stats`);
  return Response.json(data, {
    headers: { "Cache-Control": `max-age=${CACHE_TTLS.LONG}` },
  });
});
