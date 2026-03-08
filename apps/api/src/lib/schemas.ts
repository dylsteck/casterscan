import { z } from "zod";

const numericStringPattern = /^(0|[1-9]\d*)$/;

function nonNegativeIntegerStringSchema(field: string, maxLength = 20) {
  return z
    .string()
    .max(maxLength, `${field} is too large`)
    .regex(numericStringPattern, `${field} must be numeric`);
}

export const fidSchema = nonNegativeIntegerStringSchema("fid");
export const pageSizeQuerySchema = nonNegativeIntegerStringSchema("pageSize", 4)
  .transform((value) => Number(value))
  .refine((value) => value >= 1 && value <= 1000, {
    message: "pageSize must be between 1 and 1000",
  });
export const shardIndexSchema = nonNegativeIntegerStringSchema("shard_index", 4);
export const pageTokenSchema = z.string().min(1).max(512);
export const reverseQuerySchema = z.enum(["true", "false"]).transform((value) => value === "true");
export const hashSchema = z
  .string()
  .max(132)
  .regex(/^0x[a-fA-F0-9]+$/, "hash must be 0x-prefixed hex");
export const eventIdSchema = z
  .string()
  .max(128)
  .regex(/^[a-zA-Z0-9_-]+$/, "eventId contains invalid chars");
export const usernameSchema = z
  .string()
  .max(50)
  .regex(/^[a-zA-Z0-9_.-]+$/, "username contains invalid chars");
export const signerKeySchema = z
  .string()
  .max(200)
  .regex(/^[a-zA-Z0-9+/=_-]+$/, "signerKey contains invalid chars");
