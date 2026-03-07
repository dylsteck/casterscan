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
