import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { supabase } from "../../../lib/supabase";
import { TRPCError } from "@trpc/server";
import type { Database } from "~/types/database.t";

type UserPageData = {
  user: Database["public"]["Tables"]["profile"]["Row"] | TRPCError;
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
      const { data: userData, error: userError } =
        await supabase
          .from<Database["public"]["Tables"]["profile"]["Row"]>("profile")
          .select()
          .eq("username", input.username)
          .limit(1)
          .single();

      let final: TRPCError | undefined;
      if (userError || !userData) {
        console.log(userError);
        final = new TRPCError({
          message: "Invalid user.",
          code: "NOT_FOUND",
          cause: "User username may not be registered.",
        });
      }

      const user = userData || final;
      // TODO: Add list of user's most recent casts

      console.log(user);
      return {
        user,
      } as UserPageData;
    }),
  getLatestProfiles: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const { data: profiles, error: profileError } =
        await supabase
          .from<Database["public"]["Tables"]["profile"]["Row"]>("profile")
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