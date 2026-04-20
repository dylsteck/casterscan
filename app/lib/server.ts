import { createServerFn } from "@tanstack/react-start";
import type { NeynarV2Cast, NeynarV2User, ProfileKeysPage } from "./types";

const getNeynarCastServerFn = createServerFn({ method: "GET" })
  .inputValidator((data: { identifier: string; type: "url" | "hash" }) => data)
  .handler(async ({ data }) => {
    const { ensureInitialized } = await import("@/app/server/bootstrap.js");
    const { getCast } = await import("@/app/server/services/cast.js");
    await ensureInitialized();

    const hash = data.type === "hash" ? data.identifier : data.identifier.match(/0x[a-fA-F0-9]+/)?.[0];
    if (!hash) {
      throw new Error("Could not extract hash from identifier");
    }

    return getCast(hash);
  });

const getFarcasterCastServerFn = createServerFn({ method: "GET" })
  .inputValidator((data: { hash: string }) => data)
  .handler(async ({ data }) => {
    const { ensureInitialized } = await import("@/app/server/bootstrap.js");
    const { getCastFormat } = await import("@/app/server/services/cast.js");
    await ensureInitialized();

    try {
      return await getCastFormat("0", data.hash, "farcaster-api");
    } catch {
      return null;
    }
  });

const getHubCastServerFn = createServerFn({ method: "GET" })
  .inputValidator((data: { fid: number; hash: string; type: "neynar" | "farcaster" }) => data)
  .handler(async ({ data }) => {
    const { ensureInitialized } = await import("@/app/server/bootstrap.js");
    const { getCastFormat } = await import("@/app/server/services/cast.js");
    await ensureInitialized();

    try {
      const format = data.type === "neynar" ? "neynar-hub" : "farcaster-hub";
      return await getCastFormat(data.fid.toString(), data.hash, format);
    } catch {
      return null;
    }
  });

const getNeynarUserServerFn = createServerFn({ method: "GET" })
  .inputValidator((data: { fid: string }) => data)
  .handler(async ({ data }) => {
    const { ensureInitialized } = await import("@/app/server/bootstrap.js");
    const { getUser } = await import("@/app/server/services/user.js");
    await ensureInitialized();
    return getUser(data.fid);
  });

const getNeynarUserByUsernameServerFn = createServerFn({ method: "GET" })
  .inputValidator((data: { username: string }) => data)
  .handler(async ({ data }) => {
    const { ensureInitialized } = await import("@/app/server/bootstrap.js");
    const { getUserByUsername } = await import("@/app/server/services/user.js");
    await ensureInitialized();
    return getUserByUsername(data.username);
  });

const getFarcasterKeysServerFn = createServerFn({ method: "GET" })
  .inputValidator((data: { fid: string }) => data)
  .handler(async ({ data }) => {
    const { ensureInitialized } = await import("@/app/server/bootstrap.js");
    const { getKeys } = await import("@/app/server/services/keys.js");
    await ensureInitialized();
    const keys = await getKeys(data.fid);
    return {
      ...keys,
      fid: keys.fid.toString(),
    };
  });

export async function getNeynarCast(identifier: string, type: "url" | "hash"): Promise<NeynarV2Cast> {
  return getNeynarCastServerFn({ data: { identifier, type } }) as Promise<NeynarV2Cast>;
}

export async function getFarcasterCast(hash: string): Promise<unknown | null> {
  return getFarcasterCastServerFn({ data: { hash } });
}

export async function getHubCast(fid: number, hash: string, type: "neynar" | "farcaster"): Promise<unknown | null> {
  return getHubCastServerFn({ data: { fid, hash, type } });
}

export async function getNeynarUser(fid: string): Promise<NeynarV2User> {
  return getNeynarUserServerFn({ data: { fid } }) as Promise<NeynarV2User>;
}

export async function getNeynarUserByUsername(username: string): Promise<NeynarV2User> {
  return getNeynarUserByUsernameServerFn({ data: { username } }) as Promise<NeynarV2User>;
}

export async function getFarcasterKeys(fid: string): Promise<ProfileKeysPage> {
  const data = await getFarcasterKeysServerFn({
    data: { fid },
  });
  return {
    fid: BigInt(data.fid),
    authAddresses: data.authAddresses,
    signerKeys: data.signerKeys,
    page: data.page,
    pageSize: data.pageSize,
    hasMore: data.hasMore,
  };
}
