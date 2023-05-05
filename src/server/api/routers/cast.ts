import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

import { supabase } from '../../../lib/supabase';
import { TRPCError } from "@trpc/server";
import type { MergedCast } from "~/types/database.t";

import { Kysely, PostgresDialect } from 'kysely'
import Pool from 'pg-pool'

export const castsRouter = createTRPCRouter({
  getLatestCasts: publicProcedure
    .input(
      z.object({
        startRow: z.number(),
      })
    )
    .query(async ({ input }) => {
      input.startRow;

      const db = new Kysely({
        dialect: new PostgresDialect({
          pool: new Pool({
            connectionString: process.env.PG_CONNECTION_STRING,
          }),
        }),
      });

      //const casts = db.selectFrom('casts').selectAll();
      const castsRequest = await db
      .selectFrom('casts')
      .innerJoin('profile', 'profile.id', 'casts.fid')
      .select(['deleted', 'fid', 'hash', 'mentions', 'parent_fid', 'parent_hash', 'pruned', 'published_at', 'signature', 'signer', 'text', 'thread_hash', 'profile.avatar_url as userAvatarUrl', 'profile.bio as userBio', 'profile.display_name as userDisplayName', 'profile.registered_at as userRegisteredAt', 'profile.url as userUrl', 'profile.username as userUsername'])
      .orderBy('published_at', 'desc')
      .offset(input.startRow)
      .limit(32)
      .execute();

      const casts = castsRequest as MergedCast[];
      console.log(casts)
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
      const { data: casts, error: castError } = await supabase
        .from('casts')
        .select()
        .eq('author_username', input.username)
        .order('published_at', {ascending: false})
        .range(input.startRow, input.startRow + 32);

      if (castError || !casts) {
        console.log("Error:\n", castError);
        throw new TRPCError({
          message: "Failed to fetch user casts.",
          code: "NOT_FOUND",
          cause: "An error occurred while fetching the user's casts."
        });
      }
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
        const { data: castData, error: castError } = await supabase
        .from('casts')
        .select()
        .eq('hash', input.hash);

        if (castError || !castData) {
          console.log("Error:\n", castError);
          throw new TRPCError({
            message: "Failed to fetch cast.",
            code: "NOT_FOUND",
            cause: "An error occurred while fetching the cast."
          });
        }
        
        const cast = castData[0];
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
