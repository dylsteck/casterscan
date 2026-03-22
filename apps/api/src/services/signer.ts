import { decodeAbiParameters } from "viem";
import { getCached } from "../cache/cached.js";
import { cacheKeys, cacheTTL } from "../cache/keys.js";
import { getUpstream } from "../upstream-instance.js";
import { getFidMessages } from "./fid.js";
import { signedKeyRequestAbi } from "../upstream/signed-key-request-abi.js";
import type {
  SnapchainCastMessage,
  SnapchainReactionMessage,
  SnapchainLinkMessage,
  SnapchainVerificationMessage,
  SnapchainOnChainEvent,
} from "../upstream/types.js";

const FARCASTER_EPOCH = 1609459200;

function farcasterTimeToDate(time: number): Date {
  return new Date((FARCASTER_EPOCH + time) * 1000);
}

function decodeSignerMetadata(metadata: string) {
  try {
    const metadataHex = `0x${Buffer.from(metadata, "base64").toString("hex")}` as `0x${string}`;
    const decoded = decodeAbiParameters(signedKeyRequestAbi, metadataHex)[0];

    return {
      requestFid: Number(decoded.requestFid),
      requestSigner: decoded.requestSigner,
      signature: decoded.signature,
      deadline: Number(decoded.deadline),
    };
  } catch {
    return null;
  }
}

type MessageWithType =
  | (SnapchainCastMessage & { messageType: "cast" })
  | (SnapchainReactionMessage & { messageType: "reaction" })
  | (SnapchainLinkMessage & { messageType: "link" })
  | (SnapchainVerificationMessage & { messageType: "verification" });

function getTimestamp(msg: { data?: { timestamp?: number }; timestamp?: number }): number {
  return msg.data?.timestamp ?? msg.timestamp ?? 0;
}

export async function getSignersEnriched(fid: string) {
  const up = getUpstream();
  if (!up) throw new Error("Upstream not initialized");

  return getCached(
    cacheKeys.fidSignersEnriched(fid),
    cacheTTL.fidSignersEnriched,
    async () => {
      const [signersData, userCasts, userReactions, userLinks, userVerifications] =
        await Promise.all([
          up.snapchain
            .getOnChainSignersByFid({ fid, pageSize: 1000 })
            .catch(() => ({ events: [] as SnapchainOnChainEvent[] })),
          up.snapchain.getAllCastsByFid(fid),
          up.snapchain.getAllReactionsByFid(fid, "None"),
          up.snapchain.getAllLinksByFid(fid),
          up.snapchain.getAllVerificationsByFid(fid),
        ]);

      const addSigners =
        signersData.events?.filter(
          (s) => s.signerEventBody?.eventType === "SIGNER_EVENT_TYPE_ADD"
        ) ?? [];

      const appSignerPairs: Array<{ appFid: string; signerKey: string; signer: typeof addSigners[0] }> = [];
      const signerKeyToAppFids: Record<string, Set<string>> = {};

      for (const signer of addSigners) {
        if (!signer.signerEventBody) continue;
        const metadata = decodeSignerMetadata(signer.signerEventBody.metadata);
        if (!metadata || metadata.requestFid === 0) continue;

        const appFid = metadata.requestFid.toString();
        const signerKey = signer.signerEventBody.key;

        appSignerPairs.push({ appFid, signerKey, signer });
        if (!signerKeyToAppFids[signerKey]) {
          signerKeyToAppFids[signerKey] = new Set();
        }
        signerKeyToAppFids[signerKey].add(appFid);
      }

      const messagesBySigner: Record<
        string,
        { casts: number; reactions: number; links: number; verifications: number; total: number; lastUsed: string | null }
      > = {};
      const allUserMessages = [
        ...userCasts.map((m) => ({ ...m, type: "cast" as const })),
        ...userReactions.map((m) => ({ ...m, type: "reaction" as const })),
        ...userLinks.map((m) => ({ ...m, type: "link" as const })),
        ...userVerifications.map((m) => ({ ...m, type: "verification" as const })),
      ];

      for (const message of allUserMessages) {
        const signerKey = message.signer;
        if (!signerKeyToAppFids[signerKey]) continue;

        for (const appFid of signerKeyToAppFids[signerKey]) {
          const compositeKey = `${appFid}:${signerKey}`;
          if (!messagesBySigner[compositeKey]) {
            messagesBySigner[compositeKey] = {
              casts: 0,
              reactions: 0,
              links: 0,
              verifications: 0,
              total: 0,
              lastUsed: null,
            };
          }

          if (message.type === "cast") messagesBySigner[compositeKey].casts++;
          else if (message.type === "reaction") messagesBySigner[compositeKey].reactions++;
          else if (message.type === "link") messagesBySigner[compositeKey].links++;
          else if (message.type === "verification") messagesBySigner[compositeKey].verifications++;

          messagesBySigner[compositeKey].total++;

          const timestamp = getTimestamp(message);
          if (timestamp) {
            const messageDate = farcasterTimeToDate(timestamp);
            if (
              !messagesBySigner[compositeKey].lastUsed ||
              messageDate > new Date(messagesBySigner[compositeKey].lastUsed!)
            ) {
              messagesBySigner[compositeKey].lastUsed = messageDate.toISOString();
            }
          }
        }
      }

      const appsMap: Record<
        string,
        {
          fid: number;
          signers: unknown[];
          totalMessages: number;
          lastUsed: string | null;
          appStats: { casts: number; reactions: number; links: number; verifications: number };
        }
      > = {};

      for (const { appFid, signerKey, signer } of appSignerPairs) {
        if (!appsMap[appFid]) {
          const metadata = decodeSignerMetadata(signer.signerEventBody.metadata);
          appsMap[appFid] = {
            fid: metadata!.requestFid,
            signers: [],
            totalMessages: 0,
            lastUsed: null,
            appStats: {
              casts: 0,
              reactions: 0,
              links: 0,
              verifications: 0,
            },
          };
        }

        const compositeKey = `${appFid}:${signerKey}`;
        const signerStats = messagesBySigner[compositeKey] ?? {
          casts: 0,
          reactions: 0,
          links: 0,
          verifications: 0,
          total: 0,
          lastUsed: null,
        };

        const processedSigner = {
          key: signerKey,
          keyType: signer.signerEventBody.keyType,
          eventType: signer.signerEventBody.eventType,
          blockNumber: signer.blockNumber,
          transactionHash: signer.transactionHash,
          blockTimestamp: signer.blockTimestamp,
          metadata: decodeSignerMetadata(signer.signerEventBody.metadata),
          messageStats: signerStats,
        };

        appsMap[appFid].signers.push(processedSigner);
        appsMap[appFid].totalMessages += signerStats.total;
        appsMap[appFid].appStats.casts += signerStats.casts;
        appsMap[appFid].appStats.reactions += signerStats.reactions;
        appsMap[appFid].appStats.links += signerStats.links;
        appsMap[appFid].appStats.verifications += signerStats.verifications;

        if (signerStats.lastUsed) {
          const signerLastUsed = new Date(signerStats.lastUsed);
          if (
            !appsMap[appFid].lastUsed ||
            signerLastUsed > new Date(appsMap[appFid].lastUsed!)
          ) {
            appsMap[appFid].lastUsed = signerStats.lastUsed;
          }
        }
      }

      const apps = Object.values(appsMap);
      const profileByFid: Record<string, unknown> = {};

      if (apps.length > 0) {
        try {
          const users = await up.neynar.getUsers({
            fids: apps.map((app) => app.fid.toString()),
          });

          for (const user of users) {
            profileByFid[user.fid.toString()] = user;
          }
        } catch {
          // Profiles optional
        }
      }

      const appsWithProfiles = apps.map((app) => {
        const profile = profileByFid[app.fid.toString()];
        return profile ? { ...app, profile } : app;
      });

      return appsWithProfiles
        .filter((app) => app.totalMessages > 0)
        .sort((a, b) => {
          const aLastUsed = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
          const bLastUsed = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
          return bLastUsed - aLastUsed;
        });
    }
  );
}

export async function getSignerMessages(fid: string, signerKey: string): Promise<MessageWithType[]> {
  return getCached(
    cacheKeys.fidSignerMessages(fid, signerKey),
    cacheTTL.fidSignerMessages,
    async () => {
      const { casts, reactions, links, verifications } = await getFidMessages(fid);

      const all: MessageWithType[] = [
        ...casts
          .filter((m) => m.signer === signerKey)
          .map((m) => ({ ...m, messageType: "cast" as const })),
        ...reactions
          .filter((m) => m.signer === signerKey)
          .map((m) => ({ ...m, messageType: "reaction" as const })),
        ...links
          .filter((m) => m.signer === signerKey)
          .map((m) => ({ ...m, messageType: "link" as const })),
        ...verifications
          .filter((m) => m.signer === signerKey)
          .map((m) => ({ ...m, messageType: "verification" as const })),
      ];

      return all.sort((a, b) => getTimestamp(b) - getTimestamp(a));
    }
  );
}

export async function getSignerStats(
  fid: string,
  signerKey: string
): Promise<{
  casts: number;
  reactions: number;
  links: number;
  verifications: number;
  total: number;
  lastUsed: string | null;
}> {
  return getCached(
    cacheKeys.fidSignerStats(fid, signerKey),
    cacheTTL.fidSignerStats,
    async () => {
      const { casts, reactions, links, verifications } = await getFidMessages(fid);

      const filteredCasts = casts.filter((m) => m.signer === signerKey);
      const filteredReactions = reactions.filter((m) => m.signer === signerKey);
      const filteredLinks = links.filter((m) => m.signer === signerKey);
      const filteredVerifications = verifications.filter((m) => m.signer === signerKey);

      let lastUsed: string | null = null;
      const all = [
        ...filteredCasts,
        ...filteredReactions,
        ...filteredLinks,
        ...filteredVerifications,
      ];

      for (const msg of all) {
        const ts = getTimestamp(msg);
        if (ts) {
          const d = farcasterTimeToDate(ts);
          if (!lastUsed || d > new Date(lastUsed)) {
            lastUsed = d.toISOString();
          }
        }
      }

      return {
        casts: filteredCasts.length,
        reactions: filteredReactions.length,
        links: filteredLinks.length,
        verifications: filteredVerifications.length,
        total: all.length,
        lastUsed,
      };
    }
  );
}
