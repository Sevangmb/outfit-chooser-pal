export interface FollowStats {
  followers_count: number;
  following_count: number;
}

export interface Follower {
  id: number;
  follower_id: string;
  following_id: string;
  created_at: string;
  profile?: {
    id: string;
    email: string;
  }
}