import { createPublicClient, http, getAddress } from 'viem';
import { optimism } from 'viem/chains';
import { ProfileKeysPage } from '../types';

export const KEY_REGISTRY = '0x00000000fc1237824fb747abde0ff18990e59b7e' as const;

export const keyRegistryAbi = [
  {
    type: 'function',
    name: 'keysOf',
    stateMutability: 'view',
    inputs: [
      { name: 'fid', type: 'uint256' },
      { name: 'state', type: 'uint8' },
      { name: 'startIdx', type: 'uint256' },
      { name: 'batchSize', type: 'uint256' },
    ],
    outputs: [{ name: 'keys', type: 'bytes[]' }],
  },
  {
    type: 'function',
    name: 'keyDataOf',
    stateMutability: 'view',
    inputs: [
      { name: 'fid', type: 'uint256' },
      { name: 'key', type: 'bytes' },
    ],
    outputs: [
      { name: 'state', type: 'uint8' },
      { name: 'keyType', type: 'uint32' },
    ],
  },
] as const;

const publicClient = createPublicClient({
  chain: optimism,
  transport: http(process.env.OP_RPC_URL || 'https://mainnet.optimism.io'),
});

export async function fetchKeysForFid(
  fid: bigint,
  page: number = 0,
  pageSize: number = 250
): Promise<ProfileKeysPage> {
  try {
    const startIdx = BigInt(page * pageSize);
    
    // Get keys from the registry
    const keys = await publicClient.readContract({
      address: KEY_REGISTRY,
      abi: keyRegistryAbi,
      functionName: 'keysOf',
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

    // Build multicall contracts for keyDataOf
    const contracts = keys.map((key) => ({
      address: KEY_REGISTRY,
      abi: keyRegistryAbi,
      functionName: 'keyDataOf' as const,
      args: [fid, key],
    }));

    // Execute multicall to get key data
    const keyDataResults = await publicClient.multicall({
      contracts,
    });

    const authAddresses: `0x${string}`[] = [];
    const signerKeys: `0x${string}`[] = [];

    // Process results
    keyDataResults.forEach((result, index) => {
      if (result.status === 'success' && result.result) {
        const [state, keyType] = result.result as [number, number];
        
        // Only process ADDED keys (state === 1)
        if (state === 1) {
          const key = keys[index];
          
          if (keyType === 2) {
            // AUTH key - decode last 20 bytes to get EOA
            const keyHex = key.slice(2); // Remove 0x prefix
            const addressHex = keyHex.slice(-40); // Last 20 bytes = 40 hex chars
            try {
              const checksummedAddress = getAddress(`0x${addressHex}` as `0x${string}`);
              authAddresses.push(checksummedAddress);
            } catch (error) {
              console.warn('Failed to checksum address:', `0x${addressHex}`, error);
            }
          } else if (keyType === 1) {
            // SIGNER key - keep as 32-byte hex
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
    console.error('Error fetching keys for FID:', fid, error);
    return {
      fid,
      authAddresses: [],
      signerKeys: [],
      page,
      pageSize,
      hasMore: false,
    };
  }
}
