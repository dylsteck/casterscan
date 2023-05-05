export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      casts: {
        Row: {
          deleted: boolean
          fid: number
          hash: string
          mentions: Json | null
          parent_fid: number | null
          parent_hash: string | null
          pruned: boolean | null
          published_at: string
          signature: string
          signer: string
          text: string
          thread_hash: string | null
        }
        Insert: {
          deleted?: boolean
          fid: number
          hash: string
          mentions?: Json | null
          parent_fid?: number | null
          parent_hash?: string | null
          pruned?: boolean | null
          published_at: string
          signature: string
          signer: string
          text: string
          thread_hash?: string | null
        }
        Update: {
          deleted?: boolean
          fid?: number
          hash?: string
          mentions?: Json | null
          parent_fid?: number | null
          parent_hash?: string | null
          pruned?: boolean | null
          published_at?: string
          signature?: string
          signer?: string
          text?: string
          thread_hash?: string | null
        }
      }
      event: {
        Row: {
          created_at: string | null
          id: number
        }
        Insert: {
          created_at?: string | null
          id?: number
        }
        Update: {
          created_at?: string | null
          id?: number
        }
      }
      profile: {
        Row: {
          avatar_url: string | null
          bio: string | null
          display_name: string | null
          id: number
          owner: string | null
          registered_at: string | null
          updated_at: string | null
          url: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          display_name?: string | null
          id: number
          owner?: string | null
          registered_at?: string | null
          updated_at?: string | null
          url?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          display_name?: string | null
          id?: number
          owner?: string | null
          registered_at?: string | null
          updated_at?: string | null
          url?: string | null
          username?: string | null
        }
      }
      reaction: {
        Row: {
          created_at: string | null
          fid: number
          pruned: boolean | null
          signer: string
          target_cast: string
          target_fid: number
          type: string
        }
        Insert: {
          created_at?: string | null
          fid?: number
          pruned?: boolean | null
          signer: string
          target_cast: string
          target_fid: number
          type: string
        }
        Update: {
          created_at?: string | null
          fid?: number
          pruned?: boolean | null
          signer?: string
          target_cast?: string
          target_fid?: number
          type?: string
        }
      }
      signer: {
        Row: {
          created_at: string | null
          fid: number
          name: string | null
          pruned: boolean | null
          signer: string
        }
        Insert: {
          created_at?: string | null
          fid?: number
          name?: string | null
          pruned?: boolean | null
          signer: string
        }
        Update: {
          created_at?: string | null
          fid?: number
          name?: string | null
          pruned?: boolean | null
          signer?: string
        }
      }
      verification: {
        Row: {
          address: string
          created_at: string | null
          fid: number
          pruned: boolean | null
          signature: string
          signer: string
        }
        Insert: {
          address: string
          created_at?: string | null
          fid: number
          pruned?: boolean | null
          signature: string
          signer: string
        }
        Update: {
          address?: string
          created_at?: string | null
          fid?: number
          pruned?: boolean | null
          signature?: string
          signer?: string
        }
      }
    }
    Views: {
      profile_with_verification: {
        Row: {
          avatar_url: string | null
          bio: string | null
          display_name: string | null
          id: number | null
          owner: string | null
          registered_at: string | null
          updated_at: string | null
          url: string | null
          username: string | null
          verifications: Json | null
        }
      }
    }
    Functions: {
      casts_regex: {
        Args: {
          regex: string
        }
        Returns: {
          deleted: boolean
          fid: number
          hash: string
          mentions: Json | null
          parent_fid: number | null
          parent_hash: string | null
          pruned: boolean | null
          published_at: string
          signature: string
          signer: string
          text: string
          thread_hash: string | null
        }[]
      }
      get_profile_by_address: {
        Args: {
          connected_address: string
        }
        Returns: {
          avatar_url: string | null
          bio: string | null
          display_name: string | null
          id: number
          owner: string | null
          registered_at: string | null
          updated_at: string | null
          url: string | null
          username: string | null
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export interface MergedCast {
    deleted: boolean
    fid: number
    hash: string
    mentions: Json | null
    parent_fid: number | null
    parent_hash: string | null
    pruned: boolean | null
    published_at: string
    signature: string
    signer: string
    text: string
    thread_hash: string | null
    userAvatarUrl: string | null
    userBio: string | null
    userDisplayName: string | null
    userRegisteredAt: string | null
    userUrl: string | null
    userUsername: string | null
}