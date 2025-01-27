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