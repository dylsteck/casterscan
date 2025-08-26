import type { NeynarV2User, NeynarV2Cast } from 'shared/dist';

const NEYNAR_API_URL = 'https://api.neynar.com';

export class NeynarService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NEYNAR_API_KEY || 'NEYNAR_API_DOCS';
    if (!this.apiKey) {
      console.warn('⚠️ NEYNAR_API_KEY not set - Neynar features will be limited');
    }
  }

  async getNeynarUser(fid: string): Promise<NeynarV2User> {
    try {
      const response = await fetch(
        `${NEYNAR_API_URL}/v2/farcaster/user/bulk?fids=${fid}`,
        {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch Neynar user');
      const data = await response.json() as any;
      return data.users[0];
    } catch (error) {
      console.error('Error fetching Neynar user:', error);
      throw error;
    }
  }

  async getNeynarCast(identifier: string, type: 'url' | 'hash'): Promise<NeynarV2Cast> {
    try {
      const response = await fetch(
        `${NEYNAR_API_URL}/v2/farcaster/cast?identifier=${identifier}&type=${type}`,
        {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch Neynar cast');
      const data = await response.json() as any;
      return data.cast;
    } catch (error) {
      console.error('Error fetching Neynar cast:', error);
      throw error;
    }
  }
}
