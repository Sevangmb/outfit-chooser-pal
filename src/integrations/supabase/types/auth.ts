export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface AuthTypes {
  Tables: {
    user_roles: {
      Row: {
        id: string
        user_id: string | null
        role: 'admin' | 'user' | null
        created_at: string
      }
      Insert: {
        id?: string
        user_id?: string | null
        role?: 'admin' | 'user' | null
        created_at?: string
      }
      Update: {
        id?: string
        user_id?: string | null
        role?: 'admin' | 'user' | null
        created_at?: string
      }
    }
  }
}