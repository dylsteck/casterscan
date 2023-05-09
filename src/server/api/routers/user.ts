import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import type { KyselyDB } from "~/types/database.t";
import type { NFTDData } from "~/types/nftd.t";
import { db } from "~/lib/kysely";

interface Social {
  userAddress: string;
  userAssociatedAddresses: string[];
}

interface QueryResponse {
  data: {
    Socials: {
      Social: Social[];
    }
  }
}

interface UserResponse {
  result?: {
    user?: {
      followerCount?: number;
      followingCount?: number;
      referrerUsername?: string;
    }
  }
}

interface NFTDResponse {
  data: NFTDData[];
}

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
          'authorization': `Bearer ${process.env.FARCASTER_BEARER_TOKEN ?? ''}`,
        },
      };

      const warpUserData = await fetch(`https://api.warpcast.com/v2/user?fid=${userRequest?.id as string}`, options)
      const finalWarpData = await warpUserData.json() as UserResponse;

      const finalUserRequest = userRequest;
      // double check this works
      if(finalUserRequest?.id){
        finalUserRequest.id = finalUserRequest?.id;
      }
      
      const finalUserObject = {
        ...finalUserRequest,
        followers: finalWarpData?.result?.user?.followerCount ?? 0,
        following: finalWarpData?.result?.user?.followingCount ?? 0,
        referrer: finalWarpData?.result?.user?.referrerUsername ?? ''
      };

      if (!userRequest) {
        console.log(userRequest);
          throw new TRPCError({
            message: "Invalid user.",
            code: "NOT_FOUND",
            cause: "User username may not be registered.",
          });
      }

      const user = finalUserObject as KyselyDB['mergedUser'];
      console.log("FINAL", user)

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
      const query = `
        query MyQuery {
          Socials(
            input: {
              filter: {
                dappName: {_eq: farcaster},
                userId: {_eq: "${input.fid}"}
              },
              blockchain: ethereum
            }
          ) {
            Social{
              userAddress
              userAssociatedAddresses
            }
          }
        }
      `;
      // TODO: if verification in db, grab from db, if not, request from Airstack *and* add record to db
      const response = await fetch(process.env.AIRSTACK_GQL_ENDPOINT ?? '', {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ query }),
      });

      const json = await response.json() as QueryResponse;
      const data = json.data;
      const final: Social | undefined = data?.Socials?.Social?.[0];

      if (final) {
        const associatedAddress: string | undefined = final.userAssociatedAddresses
          .filter((address: string): address is string => Boolean(address) && address !== final.userAddress)
          .find(Boolean);

        if (associatedAddress) {
          try {
            const response = await fetch(`${process.env.NFTD_USER_ENDPOINT ?? ''}${associatedAddress}`);
            if (!response.ok) {
              throw new Error(`Failed to fetch NF.TD data. Response status: ${response.status}`);
            }
            const allData = (await response.json()) as NFTDResponse;
            const data = allData.data;

            return data;
          } catch (error) {
            console.error(error);
          }
        }
      }

      return null;
    }),
  getLatestProfiles: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        startRow: z.number(),
      })
    )
    .query(async ({ input }) => {
      // todo: work on sort by desc, doesn't work because of so much null data
      const profilesRequest = await db
      .selectFrom('profile')
      .select(['id', 'owner', 'username', 'display_name', 'avatar_url', 'bio', 'registered_at', 'updated_at', 'url'])
      .orderBy('id', 'asc')
      .offset(input.startRow)
      .limit(32)
      .execute();

      if (!profilesRequest) {
        console.log("Error:\n", profilesRequest);
        throw new TRPCError({
          message: "Failed to fetch latest profiles.",
          code: "NOT_FOUND",
          cause:
            "An error occurred while fetching the latest profiles.",
        });
      }

      const profiles = profilesRequest as KyselyDB['profile'][];

      if (profilesRequest.length === 0) {
        throw new TRPCError({
          message: "No profiles found.",
          code: "NOT_FOUND",
          cause: "No profiles were found in the database.",
        });
      }

      return {
        profiles,
      };
    }),
});
