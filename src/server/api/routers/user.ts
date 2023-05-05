import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { supabase } from "../../../lib/supabase";
import { TRPCError } from "@trpc/server";
import type { MergedUser, Database } from "~/types/database.t";
import type { NFTDData } from "~/types/nftd.t";
import { db } from "~/lib/kysely";


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

      const userRequest = await db
        .selectFrom('profile')
        .select(['avatar_url', 'bio', 'display_name', 'id', 'owner', 'registered_at', 'updated_at', 'url', 'username'])
        .where('profile.username', '=', input.username)
        .executeTakeFirst();

      const options: RequestInit = {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'authorization': `Bearer ${process.env.FARCASTER_BEARER_TOKEN}`,
        },
      };

      const warpUserData = await fetch(`https://api.warpcast.com/v2/user?fid=${userRequest?.id}`, options)
      const finalWarpData = await warpUserData.json();
      
      const finalUserObject = {
        ...userRequest,
        followers: finalWarpData.result.user.followerCount,
        following: finalWarpData.result.user.followingCount,
        referrer: finalWarpData.result.user.referrerUsername
      };

      if (!userRequest) {
        console.log(userRequest);
          throw new TRPCError({
            message: "Invalid user.",
            code: "NOT_FOUND",
            cause: "User username may not be registered.",
          });
      }

      const user = finalUserObject as MergedUser

      return {
        user,
      }
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
          const response = await fetch(`${process.env.NFTD_USER_ENDPOINT ?? ''}${wallet ?? ''}`);
          console.log("RESP", response);
          if (!response.ok) {
            // handle non-2xx responses
            throw new Error(`Failed to fetch NF.TD data. Response status: ${response.status}`);
          }
          const jsonData = await response.json()
          const data = await response.json() as NFTDData;
          return data;
        } catch (error) {
          console.error(error);
          // throw new TRPCError({
          //   message: 'Failed to fetch NF.TD data.',
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
