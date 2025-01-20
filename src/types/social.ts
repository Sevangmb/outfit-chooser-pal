export interface Profile {
  id: string;
  email: string;
}

export interface Follower {
  id: number;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower?: Profile;
  following?: Profile;
}