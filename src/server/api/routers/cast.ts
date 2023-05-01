import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

import { supabase } from '../../../lib/supabase';
import { TRPCError } from "@trpc/server";
import type { MergedCast } from "~/types/database.t";

export const castsRouter = createTRPCRouter({
  getLatestCasts: publicProcedure
    .input(
      z.object({
        startRow: z.number(),
      })
    )
    .query(async ({ input }) => {
      input.startRow;

      // fix input type
      const getProfilesAndMergeWithCasts = async(castList: any): Promise<any> => {
        const profilePromises = castList.map(async (c: any) => {
          const { data: profile, error: profileError } = await supabase
            .from("profile")
            .select()
            .eq("id", c.fid)
            .single();
          if (profileError || !profile) {
            console.log("Error:\n", profileError);
            throw new TRPCError({
              message: `Failed to fetch profile for fid ${c.fid}.`,
              code: "NOT_FOUND",
              cause: "An error occurred while fetching the profile.",
            });
          }
          const cast = { ...c, user: profile } as MergedCast;
          // Merge the profile data into the cast object
          return cast;
      })
      return Promise.all(profilePromises);
    };

      const { data: castData, error: castError } = await supabase
        .from('casts')
        .select()
        .order('published_at', { ascending: false })
        .range(input.startRow, input.startRow + 34);

      if (castError || !castData) {
        console.log("Error:\n", castError);
        throw new TRPCError({
          message: "Failed to fetch latest casts.",
          code: "NOT_FOUND",
          cause: "An error occurred while fetching the latest casts."
        });
      }

      const casts = await getProfilesAndMergeWithCasts(castData);

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
