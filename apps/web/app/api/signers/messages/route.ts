import { NextRequest } from "next/server";
import { apiFetch } from "@/app/lib/api";
import { CACHE_TTLS } from "@/app/lib/utils";

export async function GET(request: NextRequest) {
  const fid = request.nextUrl.searchParams.get("fid");
  const signer = request.nextUrl.searchParams.get("signer");

  if (!fid || !signer) {
    return Response.json(
      { error: "fid and signer parameters required" },
      { status: 400 }
    );
  }

  const data = await apiFetch(
    `/v1/fids/${fid}/signers/${encodeURIComponent(signer)}/messages`
  );
  return Response.json(data, {
    headers: { "Cache-Control": `max-age=${CACHE_TTLS.LONG}` },
  });
}
