import { z } from "zod";

export const fidSchema = z.string().regex(/^\d+$/, "fid must be numeric");
export const hashSchema = z.string().regex(/^0x[a-fA-F0-9]+$/, "hash must be 0x-prefixed hex");
export const eventIdSchema = z.string().regex(/^[a-zA-Z0-9_-]+$/, "eventId contains invalid chars");
export const usernameSchema = z.string().max(50).regex(/^[a-zA-Z0-9_.-]+$/, "username contains invalid chars");
export const signerKeySchema = z.string().max(200).regex(/^[a-zA-Z0-9+/=_-]+$/, "signerKey contains invalid chars");
