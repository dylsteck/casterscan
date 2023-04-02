export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      casts: {
        Row: {
          author_display_name: string | null
          author_fid: number
          author_pfp_url: string | null
          author_pfp_verified: boolean | null
          author_username: string | null
          deleted: boolean | null
          hash: string
          hash_v1: string | null
          mentions: Json | null
          parent_author_fid: number | null
          parent_author_username: string | null
          parent_hash: string | null
          parent_hash_v1: string | null
          published_at: string
          reactions_count: number | null
          recasts_count: number | null
          replies_count: number | null
          text: string
          thread_hash: string
          thread_hash_v1: string | null
          watches_count: number | null
        }
        Insert: {
          author_display_name?: string | null
          author_fid: number
          author_pfp_url?: string | null
          author_pfp_verified?: boolean | null
          author_username?: string | null
          deleted?: boolean | null
          hash: string
          hash_v1?: string | null
          mentions?: Json | null
          parent_author_fid?: number | null
          parent_author_username?: string | null
          parent_hash?: string | null
          parent_hash_v1?: string | null
          published_at: string
          reactions_count?: number | null
          recasts_count?: number | null
          replies_count?: number | null
          text: string
          thread_hash: string
          thread_hash_v1?: string | null
          watches_count?: number | null
        }
        Update: {
          author_display_name?: string | null
          author_fid?: number
          author_pfp_url?: string | null
          author_pfp_verified?: boolean | null
          author_username?: string | null
          deleted?: boolean | null
          hash?: string
          hash_v1?: string | null
          mentions?: Json | null
          parent_author_fid?: number | null
          parent_author_username?: string | null
          parent_hash?: string | null
          parent_hash_v1?: string | null
          published_at?: string
          reactions_count?: number | null
          recasts_count?: number | null
          replies_count?: number | null
          text?: string
          thread_hash?: string
          thread_hash_v1?: string | null
          watches_count?: number | null
        }
      }
      profile: {
        Row: {
          avatar_url: string | null
          avatar_verified: boolean | null
          bio: string | null
          display_name: string | null
          followers: number | null
          following: number | null
          id: number
          owner: string | null
          referrer: string | null
          registered_at: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          avatar_verified?: boolean | null
          bio?: string | null
          display_name?: string | null
          followers?: number | null
          following?: number | null
          id: number
          owner?: string | null
          referrer?: string | null
          registered_at?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          avatar_verified?: boolean | null
          bio?: string | null
          display_name?: string | null
          followers?: number | null
          following?: number | null
          id?: number
          owner?: string | null
          referrer?: string | null
          registered_at?: string | null
          updated_at?: string | null
          username?: string | null
        }
      }
      verification: {
        Row: {
          address: string
          created_at: string | null
          fid: number
        }
        Insert: {
          address: string
          created_at?: string | null
          fid: number
        }
        Update: {
          address?: string
          created_at?: string | null
          fid?: number
        }
      }
    }
    Views: {
      profile_with_verification: {
        Row: {
          avatar_url: string | null
          avatar_verified: boolean | null
          bio: string | null
          display_name: string | null
          followers: number | null
          following: number | null
          id: number | null
          owner: string | null
          referrer: string | null
          registered_at: string | null
          updated_at: string | null
          username: string | null
          verifications: Json | null
        }
      }
    }
    Functions: {
      casts_regex: {
        Args: { regex: string }
        Returns: unknown
      }
      get_profile_by_address: {
        Args: { connected_address: string }
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          path_tokens: string[] | null
          updated_at: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      extension: {
        Args: { name: string }
        Returns: string
      }
      filename: {
        Args: { name: string }
        Returns: string
      }
      foldername: {
        Args: { name: string }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: { size: number; bucket_id: string }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
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

