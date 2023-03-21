export interface Cast {
    hash: string;
    thread_hash: string;
    parent_hash: string;
    author_fid: number;
    author_username: string;
    author_display_name: string;
    author_pfp_url: string;
    author_pfp_verified: boolean;
    text: string;
    published_at: string;
    mentions: null | string[];
    replies_count: number;
    reactions_count: number;
    recasts_count: number;
    watches_count: number;
    deleted: boolean;
    parent_author_fid: number;
    parent_author_username: string;
}
  