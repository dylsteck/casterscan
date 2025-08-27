import { HubEventType } from '@farcaster/hub-nodejs';
import { FarcasterApiClient } from '../farcaster';
import type { EnrichedEvent } from './types';
import { createEventLink } from './utils';

export class EventEnricher {
  private farcasterApi: FarcasterApiClient;

  constructor() {
    this.farcasterApi = new FarcasterApiClient();
  }

  async enrichEvent(rawEvent: any): Promise<EnrichedEvent | null> {
    const id = rawEvent.id?.toString() || 'unknown';
    const time = new Date().toISOString();
    const eventType = rawEvent.type as HubEventType;

    if (eventType === HubEventType.MERGE_MESSAGE) {
      const messageData = rawEvent.mergeMessageBody?.message?.data;
      if (!messageData) return null;
      
      const fid = messageData.fid || 0;
      const username = await this.farcasterApi.getUsernameByFid(fid);
      
      if (messageData.type === 1) {
        const castText = messageData.castAddBody?.text || 'Empty cast';
        const hasEmbeds = messageData.castAddBody?.embeds?.length > 0;
        const hash = rawEvent.mergeMessageBody?.message?.hash;
        const link = createEventLink(hash, id);
        
        return {
          id,
          username,
          content: castText,
          link,
          time,
          type: 'cast',
          embeds: hasEmbeds ? '+1' : undefined
        };
      }
    }
    
    return null;
  }
}
