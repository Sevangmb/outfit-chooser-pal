export interface Profile {
  id: string;
  email: string;
  created_at: string;
  has_completed_onboarding: boolean;
  status: string;
  last_login: string | null;
  username?: string;
  bio?: string;
  avatar_url?: string;
  is_profile_public?: boolean;
}

export interface Message {
  id: number;
  content: string;
  created_at: string;
  sender: {
    email: string;
    avatar_url?: string;
  };
}

export interface GroupMessage extends Message {
  group_id: number;
  sender_id: string;
}

export interface Member {
  id: number;
  user_id: string;
  email: string;
  joined_at: string;
  role: string;
  is_approved: boolean;
}

export interface Follower {
  id: number;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower: Profile;
  following: Profile;
}