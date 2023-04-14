import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { supabase } from "../../../lib/supabase";
import { TRPCError } from "@trpc/server";
import type { Database } from "~/types/database.t";

type UserPageData = {
  user: Database["public"]["Tables"]["profile"]["Row"];
};

type LatestProfilesData = {
  profiles: Database["public"]["Tables"]["profile"]["Row"][];
};

export const userRouter = createTRPCRouter({
  getUserPageData: publicProcedure
    .input(
      z.object({
        username: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      console.log("initing query to supabase for username:", input.username);
      const { data: userData, error: userError } = await supabase
        .from("profile")
        .select()
        .eq("username", input.username)
        .limit(1)
        .single();

      if (userError || !userData) {
        console.log(userError);

        if (userError.code == "PGRST116") {
          throw new TRPCError({
            message: "PGRST116",
            code: "NOT_FOUND",
            cause: "Query matches username regex, but username not found; likely to be a text-query."
          })
        } else {
          throw new TRPCError({
            message: "Invalid user.",
            code: "NOT_FOUND",
            cause: "User username may not be registered.",
          });
        }
      }

      const user = userData
      console.log(user);
      return {
        user,
      } as UserPageData;
    }),
    getUserNFTDData: publicProcedure
    .input(
      z.object({
        fid: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { data: verificationData, error: verificationError } = await supabase.from('verification').select('*').eq('fid', input.fid).limit(1).single();
      const wallet = verificationData?.address;
      if(typeof wallet !== 'undefined'){
        try {
          const response = await fetch(process.env.NFTD_USER_ENDPOINT + wallet);
          if (!response.ok) {
            // handle non-2xx responses
            throw new Error(`Failed to fetch NFT data. Response status: ${response.status}`);
          }
          const data = await response.json();
          return data;
        } catch (error) {
          console.error(error);
          // throw new TRPCError({
          //   message: 'Failed to fetch NFT data.',
          //   code: 'INTERNAL_SERVER_ERROR',
          //   cause: error.message,
          // });
        }
      }
    }),
  getLatestProfiles: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const { data: profiles, error: profileError } = await supabase
        .from("profile")
        .select()
        .limit(input.limit || 100);

      if (profileError || !profiles) {
        console.log("Error:\n", profileError);
        throw new TRPCError({
          message: "Failed to fetch latest profiles.",
          code: "NOT_FOUND",
          cause:
            "An error occurred while fetching the latest profiles.",
        });
      }

      if (profiles.length === 0) {
        throw new TRPCError({
          message: "No profiles found.",
          code: "NOT_FOUND",
          cause: "No profiles were found in the database.",
        });
      }

      return {
        profiles,
      } as LatestProfilesData;
    }),
});
