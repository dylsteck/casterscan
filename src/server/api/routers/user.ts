import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import type { KyselyDB } from "~/types/database.t";
import type { NFTDData } from "~/types/nftd.t";
import { db } from "~/lib/kysely";
import { url } from "inspector";

export const userRouter = createTRPCRouter({
  getUserPageData: publicProcedure
    .input(
      z.object({
        username: z.string().min(1),
      })
    )
    .query(async ({ input }) => {

      const userRequest = await db
      .selectFrom('profiles')
      .selectAll()
      .where('profiles.fname', '=', input.username)
      .executeTakeFirst();

      if (!userRequest) {
        throw new TRPCError({
          message: `Failed to fetch username ${input.username}.`,
          code: "NOT_FOUND",
          cause: `An error occurred while fetching username ${input.username}.`,
        });
      }

      const user = {
        fid: userRequest.fid,
        created_at: userRequest.created_at,
        custody_address: `0x${userRequest.custody_address.toString('hex')}`,
        pfp: userRequest.pfp,
        display: userRequest.display,
        bio: userRequest.bio,
        url: userRequest.url,
        fname: userRequest.fname
      };

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

      const user = await db
      .selectFrom('profiles')
      .selectAll()
      .where('profiles.fid', '=', BigInt(input.fid))
      .executeTakeFirst();

      if (!user) {
        throw new TRPCError({
          message: `Failed to fetch user with FID ${input.fid}.`,
          code: "NOT_FOUND",
          cause: `An error occurred while fetching user with FID ${input.fid}.`,
        });
      }

      try {
        // hard-coding my wallet until I fix my custody_address value in the DB
        const userAddress = Number(user.fid) === 616 ? '0x7e37C3A9349227B60503DDB1574A76d10C6bc48E' : `0x${user.custody_address.toString('hex')}`;
        // falls back for some users too, so switch fallback to airstack endpoint
        const response = await fetch(`${process.env.NFTD_USER_ENDPOINT ?? ''}${userAddress}`, {
          method: 'GET',
          headers: {
            'Authorization': `${process.env.NFTD_API_KEY ?? ''}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch NF.TD data. Response status: ${response.status}`);
        }
        const json = await response.json();
        const data = json.data as NFTDData[];

        return data;

      } catch (error) {
        console.error(error);
      }

    }),
});
