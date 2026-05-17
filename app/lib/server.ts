import { createServerFn } from "@tanstack/react-start";
import type { HypersnapV2Cast, HypersnapV2User, ProfileKeysPage } from "./types";

const getHypersnapCastServerFn = createServerFn({ method: "GET" })
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
  .inputValidator((data: { fid: number; hash: string; type: "hypersnap" | "farcaster" }) => data)
  .handler(async ({ data }) => {
    const { ensureInitialized } = await import("@/app/server/bootstrap.js");
    const { getCastFormat } = await import("@/app/server/services/cast.js");
    await ensureInitialized();

    try {
      const format = data.type === "hypersnap" ? "hypersnap-hub" : "farcaster-hub";
      return await getCastFormat(data.fid.toString(), data.hash, format);
    } catch {
      return null;
    }
  });

const getHypersnapUserServerFn = createServerFn({ method: "GET" })
  .inputValidator((data: { fid: string }) => data)
  .handler(async ({ data }) => {
    const { ensureInitialized } = await import("@/app/server/bootstrap.js");
    const { getUser } = await import("@/app/server/services/user.js");
    await ensureInitialized();
    return getUser(data.fid);
  });

const getHypersnapUserByUsernameServerFn = createServerFn({ method: "GET" })
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

export async function getHypersnapCast(identifier: string, type: "url" | "hash"): Promise<HypersnapV2Cast> {
  return getHypersnapCastServerFn({ data: { identifier, type } }) as Promise<HypersnapV2Cast>;
}

export async function getFarcasterCast(hash: string): Promise<unknown | null> {
  return getFarcasterCastServerFn({ data: { hash } });
}

export async function getHubCast(
  fid: number,
  hash: string,
  type: "hypersnap" | "farcaster"
): Promise<unknown | null> {
  return getHubCastServerFn({ data: { fid, hash, type } });
}

export async function getHypersnapUser(fid: string): Promise<HypersnapV2User> {
  return getHypersnapUserServerFn({ data: { fid } }) as Promise<HypersnapV2User>;
}

export async function getHypersnapUserByUsername(username: string): Promise<HypersnapV2User> {
  return getHypersnapUserByUsernameServerFn({ data: { username } }) as Promise<HypersnapV2User>;
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
