import { z } from "zod";

const configSchema = z.object({
  PORT: z.coerce.number().default(4000),
  REDIS_URL: z.string().url().optional(),
  NEYNAR_API_KEY: z.string().default(""),
  SNAPCHAIN_URL: z.string().url().default("https://snap.farcaster.xyz:3381"),
  FARCASTER_API_URL: z.string().url().default("https://api.farcaster.xyz"),
  OPTIMISM_RPC_URL: z.string().url().default("https://mainnet.optimism.io"),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(): Config {
  const parsed = configSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Config validation failed:", parsed.error.flatten());
    process.exit(1);
  }
  return parsed.data;
}
