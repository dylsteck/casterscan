import { Effect } from "effect";
import { decodeAbiParameters } from "viem";
import { cacheKeys, cacheTTL } from "../cache/keys.js";
import { Cache } from "../effect/cache.js";
import { runAppEffect } from "../effect/runtime.js";
import { Upstream, type AppUpstream } from "../effect/upstream.js";
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

async function getAllMessagesForFid(up: AppUpstream, fid: string) {
  const [casts, reactions, links, verifications] = await Promise.all([
    up.snapchain.getAllCastsByFid(fid),
    up.snapchain.getAllReactionsByFid(fid, "None"),
    up.snapchain.getAllLinksByFid(fid),
    up.snapchain.getAllVerificationsByFid(fid),
  ]);

  return {
    casts,
    reactions,
    links,
    verifications,
  };
}

export function getSignersEnrichedEffect(fid: string) {
  return Effect.gen(function* () {
    const cache = yield* Cache;
    const up = yield* Upstream;

    return yield* cache.getCached(
      cacheKeys.fidSignersEnriched(fid),
      cacheTTL.fidSignersEnriched,
      async () => {
        const [{ casts: userCasts, reactions: userReactions, links: userLinks, verifications: userVerifications }, signersData] =
          await Promise.all([
            getAllMessagesForFid(up, fid),
            up.snapchain
              .getOnChainSignersByFid({ fid, pageSize: 1000 })
              .catch(() => ({ events: [] as SnapchainOnChainEvent[] })),
          ]);

        const addSigners =
          signersData.events?.filter(
            (signer) => signer.signerEventBody?.eventType === "SIGNER_EVENT_TYPE_ADD"
          ) ?? [];

        const messagesBySigner: Record<
          string,
          {
            casts: number;
            reactions: number;
            links: number;
            verifications: number;
            total: number;
            lastUsed: string | null;
          }
        > = {};

        const allUserMessages = [
          ...userCasts.map((message) => ({ ...message, type: "cast" as const })),
          ...userReactions.map((message) => ({ ...message, type: "reaction" as const })),
          ...userLinks.map((message) => ({ ...message, type: "link" as const })),
          ...userVerifications.map((message) => ({ ...message, type: "verification" as const })),
        ];

        for (const message of allUserMessages) {
          const signerKey = message.signer;
          if (!messagesBySigner[signerKey]) {
            messagesBySigner[signerKey] = {
              casts: 0,
              reactions: 0,
              links: 0,
              verifications: 0,
              total: 0,
              lastUsed: null,
            };
          }

          if (message.type === "cast") messagesBySigner[signerKey].casts++;
          else if (message.type === "reaction") messagesBySigner[signerKey].reactions++;
          else if (message.type === "link") messagesBySigner[signerKey].links++;
          else if (message.type === "verification") messagesBySigner[signerKey].verifications++;

          messagesBySigner[signerKey].total++;

          const timestamp = getTimestamp(message);
          if (timestamp) {
            const messageDate = farcasterTimeToDate(timestamp);
            if (
              !messagesBySigner[signerKey].lastUsed ||
              messageDate > new Date(messagesBySigner[signerKey].lastUsed!)
            ) {
              messagesBySigner[signerKey].lastUsed = messageDate.toISOString();
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

        for (const signer of addSigners) {
          if (!signer.signerEventBody) continue;

          const metadata = decodeSignerMetadata(signer.signerEventBody.metadata);
          if (!metadata || metadata.requestFid === 0) continue;

          const appFid = metadata.requestFid.toString();
          const signerKey = signer.signerEventBody.key;

          if (!appsMap[appFid]) {
            appsMap[appFid] = {
              fid: metadata.requestFid,
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

          const signerStats = messagesBySigner[signerKey] ?? {
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
            metadata,
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
  });
}

export function getSignersEnriched(fid: string) {
  return runAppEffect(getSignersEnrichedEffect(fid));
}

export function getSignerMessagesEffect(fid: string, signerKey: string) {
  return Effect.gen(function* () {
    const cache = yield* Cache;
    const up = yield* Upstream;

    return yield* cache.getCached(
      cacheKeys.fidSignerMessages(fid, signerKey),
      cacheTTL.fidSignerMessages,
      async () => {
        const { casts, reactions, links, verifications } = await getAllMessagesForFid(up, fid);

        const all: MessageWithType[] = [
          ...casts
            .filter((message) => message.signer === signerKey)
            .map((message) => ({ ...message, messageType: "cast" as const })),
          ...reactions
            .filter((message) => message.signer === signerKey)
            .map((message) => ({ ...message, messageType: "reaction" as const })),
          ...links
            .filter((message) => message.signer === signerKey)
            .map((message) => ({ ...message, messageType: "link" as const })),
          ...verifications
            .filter((message) => message.signer === signerKey)
            .map((message) => ({ ...message, messageType: "verification" as const })),
        ];

        return all.sort((a, b) => getTimestamp(b) - getTimestamp(a));
      }
    );
  });
}

export function getSignerMessages(fid: string, signerKey: string): Promise<MessageWithType[]> {
  return runAppEffect(getSignerMessagesEffect(fid, signerKey));
}

export function getSignerStatsEffect(
  fid: string,
  signerKey: string
): Effect.Effect<{
  casts: number;
  reactions: number;
  links: number;
  verifications: number;
  total: number;
  lastUsed: string | null;
}, Error, Cache | Upstream> {
  return Effect.gen(function* () {
    const cache = yield* Cache;
    const up = yield* Upstream;

    return yield* cache.getCached(
      cacheKeys.fidSignerStats(fid, signerKey),
      cacheTTL.fidSignerStats,
      async () => {
        const { casts, reactions, links, verifications } = await getAllMessagesForFid(up, fid);

        const filteredCasts = casts.filter((message) => message.signer === signerKey);
        const filteredReactions = reactions.filter((message) => message.signer === signerKey);
        const filteredLinks = links.filter((message) => message.signer === signerKey);
        const filteredVerifications = verifications.filter((message) => message.signer === signerKey);

        let lastUsed: string | null = null;
        const all = [
          ...filteredCasts,
          ...filteredReactions,
          ...filteredLinks,
          ...filteredVerifications,
        ];

        for (const message of all) {
          const timestamp = getTimestamp(message);
          if (timestamp) {
            const messageDate = farcasterTimeToDate(timestamp);
            if (!lastUsed || messageDate > new Date(lastUsed)) {
              lastUsed = messageDate.toISOString();
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
  });
}

export function getSignerStats(
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
  return runAppEffect(getSignerStatsEffect(fid, signerKey));
}
