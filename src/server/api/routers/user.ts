import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { db } from "~/lib/kysely";

export const userRouter = createTRPCRouter({
  getUserPageData: publicProcedure
    .input(
      z.object({
        username: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const userRequest = await db
      .selectFrom('users')
      .selectAll()
      .where('users.fname', '=', input.username)
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
});