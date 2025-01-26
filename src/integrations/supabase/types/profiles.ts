import { Json } from './auth'

export interface ProfilesTypes {
  Tables: {
    profiles: {
      Row: {
        id: string
        email: string
        created_at: string
        has_completed_onboarding: boolean | null
        status: string | null
        last_login: string | null
      }
      Insert: {
        id: string
        email: string
        created_at?: string
        has_completed_onboarding?: boolean | null
        status?: string | null
        last_login?: string | null
      }
      Update: {
        id?: string
        email?: string
        created_at?: string
        has_completed_onboarding?: boolean | null
        status?: string | null
        last_login?: string | null
      }
    }
  }
}