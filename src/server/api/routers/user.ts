import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

import { MerkleAPIClient } from "@standard-crypto/farcaster-js";
import { supabase } from '../../../lib/supabase';
import { env } from "../../../env.mjs";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  getUserPageData: publicProcedure
    .input(
      z.object({
        fid: z.string()
      })
    )
    .query(async ({ input }) => {
      const { data: userData, error: userError } = await supabase
        .from('profile')
        .select('*')
        .eq('id', input.fid)
        .single();
  
      if (userError || !userData) throw new TRPCError({
        message: "Invalid user.",
        code: "NOT_FOUND",
        cause: "User FID may not be registered."
      });

      const user = userData;

      // TODO: Add list of user's most recent casts
      
      return {
        user
      };
    }),
});
