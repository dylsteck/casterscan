export interface NFTDData {
    slug: string;
    isOG: boolean;
    displayName: string;
    avatar: string;
    bio: string;
    ensData: ENSData[];
    primary_social: PrimarySocial[];
    verified_links: VerifiedLink[];
    content: Content[];
  }
  
  export interface ENSData {
    sig: string | null;
    name: string;
    type: string;
    proof: string;
    verified: boolean;
    first_added: number | null;
    last_checked: number;
    last_confirmed: number;
    signed_message: string | null;
    first_confirmed: number | null;
    connectedAddress: string;
  }
  
  export interface PrimarySocial {
    type: string;
    subtype: string;
    username: string;
    fid: number;
    last_modified: number | null;
    first_added: number;
    first_confirmed: number;
    last_checked: number | null;
    last_confirmed: number | null;
    connectedAddress: string;
    proof: string;
    verified: boolean;
    sig: string | null;
    signed_message: string | null;
  }
  
  export interface VerifiedLink {
    type: string;
    subtype: string;
    label: string;
    username: string;
    url: string;
    proof: string;
    connectedAddress: string;
    sig: string | null;
    signed_message: string | null;
    timestamp: number;
    last_modified: number | null;
    first_added: number;
    first_confirmed: number;
    last_checked: number | null;
    last_confirmed: number | null;
    verified: boolean;
  }
  
  export interface Content {
    type: string;
    label: string;
    connectedAddress: string;
    sig: string | null;
    signed_message: string | null;
    timestamp: number;
    last_modified: number | null;
    first_added: number;
    subtype?: string;
    url?: string;
    username?: string;
    proof?: string;
    nonce?: string | null;
    tweetText?: string | null;
    fid?: number;
    last_checked?: number | null;
    last_confirmed?: number | null;
    verified?: boolean;
  }  