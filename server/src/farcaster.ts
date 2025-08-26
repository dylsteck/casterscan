interface FarcasterUser {
  fid: number;
  displayName: string;
  username: string;
  pfp: {
    url: string;
    verified: boolean;
  };
  profile: {
    bio: {
      text: string;
      mentions: any[];
      channelMentions: any[];
    };
    location?: {
      placeId: string;
      description: string;
    };
    earlyWalletAdopter: boolean;
    accountLevel: string;
    url?: string;
    bannerImageUrl?: string;
  };
  followerCount: number;
  followingCount: number;
  referrerUsername?: string;
  connectedAccounts: Array<{
    connectedAccountId: string;
    platform: string;
    username: string;
    expired: boolean;
  }>;
  viewerContext: {
    following: boolean;
    followedBy: boolean;
    canSendDirectCasts: boolean;
    enableNotifications: boolean;
    hasUploadedInboxKeys: boolean;
  };
}

interface FarcasterApiResponse {
  result: {
    user: FarcasterUser;
    collectionsOwned: any[];
    extras: {
      fid: number;
      custodyAddress: string;
      ethWallets: string[];
      solanaWallets: string[];
      walletLabels: Array<{
        address: string;
        labels: string[];
      }>;
      v2: boolean;
      publicSpamLabel: string;
    };
  };
}

export class FarcasterApiClient {
  private baseUrl = 'https://api.farcaster.xyz';
  private cache = new Map<number, string>();

  async getUsernameByFid(fid: number): Promise<string> {
    if (this.cache.has(fid)) {
      return this.cache.get(fid)!;
    }

    try {
      const response = await fetch(`${this.baseUrl}/v2/user?fid=${fid}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as FarcasterApiResponse;
      const username = data.result.user.username || data.result.user.displayName || `${fid}`;
      
      this.cache.set(fid, username);
      return username;
    } catch (error) {
      console.error(`Failed to fetch username for FID ${fid}:`, error);
      return `${fid}`;
    }
  }
}
