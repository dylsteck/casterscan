import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

import { supabase } from '../../../lib/supabase';
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  getUserPageData: publicProcedure
    .input(
      z.object({
        username: z.string()
      })
    )
    .query(async ({ input }) => {
      console.log("initing query to supabase for username:", input.username);
      const { data: userData, error: userError } = await supabase
        .from('profile')
        .select()
        .eq('username', input.username)
        .limit(1)
        .single();
  
      if (userError || !userData) {
        console.log(userError);
        throw new TRPCError({
          message: "Invalid user.",
          code: "NOT_FOUND",
          cause: "User username may not be registered."
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
