export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
  bio: string | null;
  is_profile_public: boolean;
  created_at: string;
  has_completed_onboarding: boolean;
  status: string;
  last_login: string | null;
}

export interface Message {
  id: number;
  content: string;
  created_at: string;
  sender: {
    email: string;
    avatar_url?: string | null;
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