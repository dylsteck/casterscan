import { SupabaseClient } from "@supabase/supabase-js";
import { AlchemyProvider, ethers } from "ethers";
import type { NextRouter } from "next/router";
import { z } from "zod";

export default async function triggerSearch(input: string, router: NextRouter, supabaseAnonClient: SupabaseClient) {
  console.log("Triggerring search with param:", input);

  if (z.string().endsWith(".eth").safeParse(input).success) {
    console.log("Input is ENS, resolving to address.")
    //const address = await (new ethers.AlchemyProvider(env.NEXT_PUBLIC_ALCHEMY_API_KEY)).resolveName(input);
    //if (!address) {
    //  console.log("inavlid ens:", input);
    //  return;
    //}
    //const { data, error } = await supabaseAnonClient
    //  .from("verification")
    //  .select("fid")
    //  .eq("address", address);

    //if (error) {
    //  console.log("Error in triggerSearch with ENS:", error);
    //}

    //console.log(data);
    //return;
  }

  if (z.string().length(42).safeParse(input).success) {
    console.log("Input is address, calling Supabase.")
    // input is an address
    const { data, error } = await supabaseAnonClient
      .from("verification")
      .select("fid")
      .eq("address", input);

    if (error) {
      console.log("Error in triggerSearch with address:", error);
      return;
    }

    console.log(data);
    return;
  }

  await router.push(`/hash/${input}`);
}
