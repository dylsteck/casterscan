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
    getCastByHash: publicProcedure
      .input(
        z.object({
          hash: z.string()
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
});
