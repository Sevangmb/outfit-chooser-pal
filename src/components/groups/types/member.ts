export interface Member {
  id: number;
  user_id: string;
  role: string;
  joined_at: string;
  is_approved: boolean;
  email: string | null;
}