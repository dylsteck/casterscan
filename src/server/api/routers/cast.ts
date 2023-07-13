import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

import { supabase } from '../../../lib/supabase';
import { TRPCError } from "@trpc/server";
import type { KyselyDB } from "~/types/database.t";
import { db } from "~/lib/kysely";
import { sql } from "kysely";
import type { SearchListRowProps } from "~/components/Search";


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
      .where('fname', '>', '0')
      .where('text', '>', '0')
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
          finalCast.parent_hash = `0x${cast.parent_hash?.toString('hex')}`;
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

      const castsRequest = await db
      .selectFrom('casts_with_reactions_materialized')
      .selectAll('casts_with_reactions_materialized')
      .where('fname', '=', input.username)
      .where('text', '>', '0')
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
          finalCast.parent_hash = `0x${cast.parent_hash?.toString('hex')}`;
        }
        return finalCast
      }) as KyselyDB['casts_with_reactions_materialized'][];

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
        
        const cast = { hash: input.hash };

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

    const list = await query.execute(db);

    if (!list) {
      throw new TRPCError({
        message: "Failed to fetch search list.",
        code: "NOT_FOUND",
        cause: "An error occurred while fetching the search list.",
      });
    }

    return {
      list,
    };
  }),
});
