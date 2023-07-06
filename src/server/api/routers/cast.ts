import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

import { supabase } from '../../../lib/supabase';
import { TRPCError } from "@trpc/server";
import type { KyselyDB } from "~/types/database.t";
import { db } from "~/lib/kysely";
import { sql } from "kysely";
import type { ListRowProps, SearchListRowProps } from "~/components/Search";


export const castsRouter = createTRPCRouter({
  getLatestCasts: publicProcedure
    .input(
      z.object({
        startRow: z.number(),
      })
    )
    .query(async ({ input }) => {
      input.startRow;

      const castsRequest = await db
      .selectFrom('casts_with_reactions_materialized')
      .selectAll('casts_with_reactions_materialized')
      .orderBy('timestamp', 'desc')
      .offset(input.startRow)
      .limit(32)
      .execute();

      const casts = castsRequest.map((cast) => {
        let finalCast = cast
        if(finalCast.hash){
          finalCast.hash = `0x${cast.hash.toString('hex')}`;
        }
        if(finalCast.parent_hash){
          finalCast.parent_hash = `0x${cast.parent_hash.toString('hex')}`;
        }
        return finalCast
      }) as KyselyDB['casts_with_reactions_materialized'][];
      


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
    const query = sql<SearchListRowProps[]>`
  SELECT type, username, text, link, timestamp, expanded
  FROM (
    SELECT 'cast' AS type,
           casts.fname AS username,
           casts.text AS text,
           CAST(casts.hash AS text) AS link,
           casts.timestamp AS timestamp,
           false AS expanded,
           0 AS sort_order
    FROM casts_with_reactions_materialized AS casts
    WHERE to_tsvector('english', casts.text) @@ to_tsquery('english', ${input.keyword})
    UNION ALL
    SELECT 'profile' AS type,
           profiles.fname AS username,
           profiles.bio AS text,
           '/' || profiles.fname AS link,
           profiles.created_at AS timestamp,
           false AS expanded,
           CASE WHEN profiles.fname ILIKE ${input.keyword} THEN 0 ELSE 1 END AS sort_order
    FROM profiles AS profiles
    WHERE to_tsvector('english', profiles.bio) @@ to_tsquery('english', ${input.keyword})
       OR profiles.fname ILIKE ${input.keyword}
  ) AS results
  ORDER BY sort_order, CASE WHEN type = 'cast' THEN random() * 0.6 ELSE random() * 0.4 END DESC
  LIMIT 50;
`;

    const listData = await query.execute(db);

    if (!listData) {
      throw new TRPCError({
        message: "Failed to fetch search list.",
        code: "NOT_FOUND",
        cause: "An error occurred while fetching the search list.",
      });
    }
    // note: when query changes from search, gotta cancel other requests so they dont come

    // const finalData = listData.rows.map((item) => {
    //   return {
    //     type: item.type,
    //     username: item.username,
    //     text: item.text,
    //     link: item.type === 'cast' ? `0x${item.link.toString('hex')}` : item.link,
    //     timestamp: item.timestamp,
    //     expanded: item.expanded
    //   } as SearchListRowProps;
    // });

    const list = listData;
    return {
      list,
    };
  }),
});
