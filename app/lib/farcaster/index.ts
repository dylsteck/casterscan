export { Farcaster, FarcasterError } from './farcaster';
export type {
  HubCast,
  FarcasterCast,
  FarcasterErrorCode,
  FarcasterUserOptions,
  FarcasterCastOptions
} from './types';
export { fetchKeysForFid } from './keys';

import { Farcaster } from './farcaster';
export const farcaster = new Farcaster();
