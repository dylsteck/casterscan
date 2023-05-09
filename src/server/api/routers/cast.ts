import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

import { supabase } from '../../../lib/supabase';
import { TRPCError } from "@trpc/server";
import type { KyselyDB } from "~/types/database.t";
import { db } from "~/lib/kysely";

interface CastResponse {
  result?: {
    cast?: {
      replies?: {
        count?: number;
      },
      reactions?: {
        count?: number;
      },
      recasts?: {
        count?: number;
      },
      watches?: {
        count?: number;
      }
    }
  }
}

export const castsRouter = createTRPCRouter({
  getLatestCasts: publicProcedure
    .input(
      z.object({
        startRow: z.number(),
      })
    )
    .query(async ({ input }) => {
      input.startRow;

      //const casts = db.selectFrom('casts').selectAll();
      const castsRequest = await db
      .selectFrom('casts')
      .innerJoin('profile', 'profile.id', 'casts.fid')
      .select(['deleted', 'fid', 'hash', 'mentions', 'parent_fid', 'parent_hash', 'pruned', 'published_at', 'signature', 'signer', 'text', 'thread_hash', 'profile.avatar_url as userAvatarUrl', 'profile.bio as userBio', 'profile.display_name as userDisplayName', 'profile.registered_at as userRegisteredAt', 'profile.url as userUrl', 'profile.username as userUsername'])
      .orderBy('published_at', 'desc')
      .offset(input.startRow)
      .limit(32)
      .execute();

      const casts = castsRequest as KyselyDB['mergedCast'][];

      return {
        casts,
      };
    }),
    getCastsByUsername: publicProcedure
    .input(
      z.object({
        username: z.string(),
        startRow: z.number(),
      })
    )
    .query(async ({ input }) => {
      const castData = await db
        .selectFrom('casts')
        .innerJoin('profile', 'profile.id', 'casts.fid')
        .where('profile.username', '=', input.username)
        .offset(input.startRow)
        .select(['deleted', 'fid', 'hash', 'mentions', 'parent_fid', 'parent_hash', 'pruned', 'published_at', 'signature', 'signer', 'text', 'thread_hash', 'profile.avatar_url as userAvatarUrl', 'profile.bio as userBio', 'profile.display_name as userDisplayName', 'profile.registered_at as userRegisteredAt', 'profile.url as userUrl', 'profile.username as userUsername'])
        .orderBy('published_at', 'desc')
        .limit(32)
        .execute();

      if (!castData) {
        console.log("Error:\n", castData);
        throw new TRPCError({
          message: "Failed to fetch user casts.",
          code: "NOT_FOUND",
          cause: "An error occurred while fetching the user's casts."
        });
      }

      const casts = castData as KyselyDB['mergedCast'][];
      return {
        casts,
      };
    }),
    getCastByHash: publicProcedure
      .input(
        z.object({
          hash: z.string().min(5),
        })
      )
      .query(async ({ input }) => {
        const castData = await db
        .selectFrom('casts')
        .innerJoin('profile', 'profile.id', 'casts.fid')
        .select(['deleted', 'fid', 'hash', 'mentions', 'parent_fid', 'parent_hash', 'pruned', 'published_at', 'signature', 'signer', 'text', 'thread_hash', 'profile.avatar_url as userAvatarUrl', 'profile.bio as userBio', 'profile.display_name as userDisplayName', 'profile.registered_at as userRegisteredAt', 'profile.url as userUrl', 'profile.username as userUsername'])
        .where('hash', '=', input.hash)
        .executeTakeFirst();

        if (!castData) {
          console.log("Error:\n", castData);
          throw new TRPCError({
            message: "Failed to fetch cast.",
            code: "NOT_FOUND",
            cause: "An error occurred while fetching the cast."
          });
        }

        const currentCast = castData as KyselyDB['mergedCast'];

        const options: RequestInit = {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'authorization': `Bearer ${process.env.FARCASTER_BEARER_TOKEN ?? ''}`,
          },
        };
  
        const warpUserData = await fetch(`https://api.warpcast.com/v2/cast?hash=${currentCast.hash}`, options)
        const finalWarpData = await warpUserData.json() as CastResponse;
      
        const cast = {
          ...currentCast,
          replies: finalWarpData?.result?.cast?.replies?.count ?? 0,
          reactions: finalWarpData?.result?.cast?.reactions?.count ?? 0,
          recasts: finalWarpData?.result?.cast?.recasts?.count ?? 0,
          watches: finalWarpData?.result?.cast?.watches?.count ?? 0,
        } as KyselyDB['castWithReactions'];

        return {
          cast
        };
      }),
      getCastsByKeyword: publicProcedure
      .input(
        z.object({
          keyword: z.string(),
        })
      )
      .query(async ({ input }) => {
        const { data: castsData, error: castsError } = await supabase
        .from('casts')
        .select()
        .textSearch('text', `'${input.keyword}'`, { type: 'plain', config: 'english' });

        if (castsError || !castsData) {
          console.log("Error:\n", castsError);
          throw new TRPCError({
            message: "Failed to fetch casts.",
            code: "NOT_FOUND",
            cause: "An error occurred while fetching casts."
          });
        }
        const casts = castsData
        return {
          casts
        };
      }),
});
