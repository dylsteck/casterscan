import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { MerkleAPIClient } from "@standard-crypto/farcaster-js";
import { env } from "~/env.mjs";

const apiClient = new MerkleAPIClient({
  secret: env.MERKLE_APPLICATION_BEARER_TOKEN
});

export const exampleRouter = createTRPCRouter({
  lookupUser: publicProcedure
    .input(z.object({ fid: z.number() }))
    .query(async ({ input }) => {
      const user = await apiClient.lookupUserByFid(input.fid);
      return {
        user: user
      };
    }),
});
