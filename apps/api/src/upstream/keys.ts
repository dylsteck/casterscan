import { createPublicClient, http, getAddress } from "viem";
import { optimism } from "viem/chains";
import { ProfileKeysPage } from "./types.js";
import { UpstreamError } from "../lib/errors.js";

export const keyRegistryAbi = [
  {
    type: "function",
    name: "keysOf",
    stateMutability: "view",
    inputs: [
      { name: "fid", type: "uint256" },
      { name: "state", type: "uint8" },
      { name: "startIdx", type: "uint256" },
      { name: "batchSize", type: "uint256" },
    ],
    outputs: [{ name: "keys", type: "bytes[]" }],
  },
  {
    type: "function",
    name: "keyDataOf",
    stateMutability: "view",
    inputs: [
      { name: "fid", type: "uint256" },
      { name: "key", type: "bytes" },
    ],
    outputs: [
      { name: "state", type: "uint8" },
      { name: "keyType", type: "uint32" },
    ],
  },
] as const;

export const KEY_REGISTRY = "0x00000000fc1237824fb747abde0ff18990e59b7e" as const;

export type KeysConfig = {
  rpcUrl: string;
};

export async function fetchKeysForFid(
  rpcUrl: string,
  fid: bigint,
  page = 0,
  pageSize = 250
): Promise<ProfileKeysPage> {
  try {
    const publicClient = createPublicClient({
      chain: optimism,
      transport: http(rpcUrl),
    });

    const startIdx = BigInt(page * pageSize);

    const keys = await publicClient.readContract({
      address: KEY_REGISTRY,
      abi: keyRegistryAbi,
      functionName: "keysOf",
      args: [fid, 1, startIdx, BigInt(pageSize)], // state=1 (ADDED)
    });

    if (!keys || keys.length === 0) {
      return {
        fid,
        authAddresses: [],
        signerKeys: [],
        page,
        pageSize,
        hasMore: false,
      };
    }

    const contracts = keys.map((key) => ({
      address: KEY_REGISTRY,
      abi: keyRegistryAbi,
      functionName: "keyDataOf" as const,
      args: [fid, key],
    }));

    const keyDataResults = await publicClient.multicall({ contracts });

    const authAddresses: `0x${string}`[] = [];
    const signerKeys: `0x${string}`[] = [];

    keyDataResults.forEach((result, index) => {
      if (result.status === "success" && result.result) {
        const [state, keyType] = result.result as [number, number];

        if (state === 1) {
          const key = keys[index];

          if (keyType === 2) {
            const keyHex = key.slice(2);
            const addressHex = keyHex.slice(-40);
            try {
              const checksummedAddress = getAddress(`0x${addressHex}` as `0x${string}`);
              authAddresses.push(checksummedAddress);
            } catch {
              // Skip invalid addresses
            }
          } else if (keyType === 1) {
            signerKeys.push(key as `0x${string}`);
          }
        }
      }
    });

    return {
      fid,
      authAddresses,
      signerKeys,
      page,
      pageSize,
      hasMore: keys.length === pageSize,
    };
  } catch (error) {
    throw new UpstreamError(
      "keys",
      `Error fetching keys for FID: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
