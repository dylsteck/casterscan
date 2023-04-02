import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

import { supabase } from '../../../lib/supabase';
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  getUserPageData: publicProcedure
    .input(
      z.object({
        fid: z.string().transform(f => z.coerce.number().parse(f))
      })
    )
    .query(async ({ input }) => {
      console.log("initing query to supabase for FID:", input.fid);
      const { data: userData, error: userError } = await supabase
        .from('profile')
        .select()
        .eq('id', input.fid)
        .limit(1)
        .single();
  
      if (userError || !userData) {
        console.log(userError);
        throw new TRPCError({
          message: "Invalid user.",
          code: "NOT_FOUND",
          cause: "User FID may not be registered."
        })
      }

      const user = userData;

      // TODO: Add list of user's most recent casts
      
      console.log(user);
      return {
        user
      };
    }),
});
