import { NextRequest } from "next/server";
import { dataLayerFetch } from "@/app/lib/data-layer";
import { CACHE_TTLS } from "@/app/lib/utils";
import { withAxiom } from "@/app/lib/axiom/server";

export const GET = withAxiom(async (request: NextRequest) => {
  const fid = request.nextUrl.searchParams.get("fid");
  const signer = request.nextUrl.searchParams.get("signer");

  if (!fid || !signer) {
    return Response.json(
      { error: "fid and signer parameters required" },
      { status: 400 }
    );
  }

  const data = await dataLayerFetch(
    `/v1/fids/${fid}/signers/${encodeURIComponent(signer)}/messages`
  );
  return Response.json(data, {
    headers: { "Cache-Control": `max-age=${CACHE_TTLS.LONG}` },
  });
});
