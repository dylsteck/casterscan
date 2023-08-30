import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

import { supabase } from '../../../lib/supabase';
import { TRPCError, initTRPC } from "@trpc/server";
import type { KyselyDB } from "~/types/database.t";
import { db } from "~/lib/kysely";
import { sql } from "kysely";
import type { SearchListRowProps } from "~/components/Search";

export const t = initTRPC.create();

export const DB_REQUEST_LIMIT = 50;

export const castsRouter = t.router({
  getLatestCasts: t.procedure
    .input(
      z.object({
        limit: z.number().optional(),
        startRow: z.number(),
      })
    )
    .query(async (opts) => {
      const { input } = opts;
      const limit = input.limit || 32;
      const startRow = input.startRow || 0;
    const castsRequest = await db
      .selectFrom('casts')
      .innerJoin('users', 'users.fid', 'casts.fid')
      .select(['users.fname', 'users.fid', 'users.pfp', 'casts.embeds', 'casts.fid', 'casts.hash', 'casts.id', 'casts.mentions', 'casts.text', 'casts.timestamp', 'casts.parent_url as parentUrl'])
      // created_at and updated_at show errors but are correct
      .where('text', '>', '0')
      .orderBy('timestamp', 'desc')
      .offset(startRow)
      .limit(50)
      .execute();

    const casts = castsRequest.map((cast) => {
      const finalCast = cast;
      if (finalCast.hash) {
        finalCast.hash = `0x${cast.hash.toString('hex')}`;
      }
      if (finalCast.parent_hash) {
        finalCast.parent_hash = `0x${cast.parent_hash?.toString('hex')}`;
      }
      return finalCast;
    }) as KyselyDB['casts'][];
      return {
        casts
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
      .selectFrom('casts')
      .innerJoin('users', 'users.fid', 'casts.fid')
      .select(['users.fname', 'users.fid', 'users.pfp', 'casts.embeds', 'casts.fid', 'casts.hash', 'casts.id', 'casts.mentions', 'casts.text', 'casts.timestamp', 'casts.parent_url as parentUrl'])
      .where('users.fname', '=', input.username)
      .where('text', '>', '0')
      .orderBy('timestamp', 'desc')
      .offset(input.startRow)
      .limit(50)
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
      }) as KyselyDB['casts'][];

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
      const hashAsHex = Buffer.from(input.hash.substring(2), 'hex').toString('hex');
      const castsRequest = await db
        .selectFrom('casts')
        .selectAll('casts')
        .where(sql<string>`encode(hash, 'hex') = ${hashAsHex}`)
        .executeTakeFirst();

      const finalCast = () => {
        let cast = castsRequest;
        if(cast?.hash){
          cast.hash = `0x${cast.hash.toString('hex')}`;
        }
        if(cast?.parent_hash){
          cast.parent_hash = `0x${cast.parent_hash?.toString('hex')}`;
        }
        return cast as KyselyDB['casts'];
      };
      const cast = finalCast();
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
        FROM casts AS casts
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
      LIMIT ${DB_REQUEST_LIMIT};
    `;
    // need to work on this the most
    // and instant right?
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
  getCastsByChannel: publicProcedure
    .input(
      z.object({
        channelUrl: z.string(),
        startRow: z.number(),
      })
    )
    .query(async ({ input }) => {

      const castsRequest = await db
      .selectFrom('casts')
      .innerJoin('users', 'users.fid', 'casts.fid')
      .select(['users.fname', 'users.fid', 'users.pfp', 'casts.embeds', 'casts.fid', 'casts.hash', 'casts.id', 'casts.mentions', 'casts.text', 'casts.timestamp', 'casts.parent_url as parentUrl'])
      .where('parent_url', '=', input.channelUrl)
      .where('text', '>', '0')
      .orderBy('timestamp', 'desc')
      .offset(input.startRow)
      .limit(DB_REQUEST_LIMIT)
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
      }) as KyselyDB['casts'][];

      return {
        casts,
      };

    }),
});