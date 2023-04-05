import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

import { supabase } from '../../../lib/supabase';
import { TRPCError } from "@trpc/server";

export const castsRouter = createTRPCRouter({
  getLatestCasts: publicProcedure
    .input(
      z.object({
        limit: z.number().optional()
      })
    )
    .query(async ({ input }) => {
      const { data: casts, error: castError } = await supabase
        .from('casts')
        .select()
        .order('published_at', {ascending: false})
        .limit(input.limit || 100);

      if (castError || !casts) {
        console.log("Error:\n", castError);
        throw new TRPCError({
          message: "Failed to fetch latest casts.",
          code: "NOT_FOUND",
          cause: "An error occurred while fetching the latest casts."
        });
      }

      return {
        casts
      };
    }),
    getCastsByUsername: publicProcedure
    .input(
      z.object({
        username: z.string()
      })
    )
    .query(async ({ input }) => {
      const { data: casts, error: castError } = await supabase
        .from('casts')
        .select()
        .eq('author_username', input.username)
        .order('published_at', {ascending: false})
        .limit(30);

      if (castError || !casts) {
        console.log("Error:\n", castError);
        throw new TRPCError({
          message: "Failed to fetch user casts.",
          code: "NOT_FOUND",
          cause: "An error occurred while fetching the user's casts."
        });
      }

      return {
        casts
      };
    }),
    getCastByHash: publicProcedure
      .input(
        z.object({
          hash: z.string().min(5)
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
          keyword: z.string()
        })
      )
      .query(async ({ input }) => {
        const { data: castsData, error: castsError } = await supabase
        .from('casts')
        .select()
        .textSearch('text', `'${input.keyword}'` as string, { type: 'plain', config: 'english' });

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
