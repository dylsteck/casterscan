export const DEFAULT_SNAPCHAIN_NODE = 'https://snap.farcaster.xyz:3381';
export const DEFAULT_SNAPCHAIN_GRPC = 'snap.farcaster.xyz:3383';

// Alternative endpoints for better connectivity
export const ALTERNATIVE_SNAPCHAIN_ENDPOINTS = [
  'snap.farcaster.xyz:3383',
  'grpc.farcaster.xyz:3383',
  'api.farcaster.xyz:3383'
];

export function getSnapchainHttpUrl(nodeUrl?: string): string {
  return nodeUrl || DEFAULT_SNAPCHAIN_NODE;
}

export function getSnapchainGrpcHost(nodeUrl?: string): string {
  if (!nodeUrl) return DEFAULT_SNAPCHAIN_GRPC;
  
  try {
    const url = new URL(nodeUrl);
    const port = url.port === '3381' ? '3383' : url.port;
    return `${url.hostname}:${port || '3383'}`;
  } catch {
    return DEFAULT_SNAPCHAIN_GRPC;
  }
}
