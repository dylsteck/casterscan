import { HubEventType } from '@farcaster/hub-nodejs';

export interface SubscribeRequest {
  eventTypes?: HubEventType[];
  fromId?: number;
  shardIndex?: number;
}

export interface EnrichedEvent {
  id: string;
  username: string;
  content: string;
  link: string;
  time: string;
  type: string;
  embeds?: string;
}
