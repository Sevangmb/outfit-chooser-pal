// Updating the types to reflect the new user structure
export interface User {
  id: string;
  email: string;
  created_at: string;
  has_completed_onboarding: boolean;
  status: string;
  last_login: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_profile_public: boolean;
  full_name: string | null;
}

export type UserResponse = {
  data: User | null;
  error: Error | null;
};

export type UsersResponse = {
  data: User[] | null;
  error: Error | null;
};