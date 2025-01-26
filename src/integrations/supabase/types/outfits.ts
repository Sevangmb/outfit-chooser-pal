import { Json } from './auth'

export interface OutfitsTypes {
  Tables: {
    outfits: {
      Row: {
        id: number
        name: string
        description: string | null
        created_at: string
        user_id: string | null
        rating: number | null
        is_favorite: boolean | null
        is_flagged: boolean | null
        flag_reason: string | null
        moderated_at: string | null
        moderated_by: string | null
      }
      Insert: {
        id?: number
        name: string
        description?: string | null
        created_at?: string
        user_id?: string | null
        rating?: number | null
        is_favorite?: boolean | null
        is_flagged?: boolean | null
        flag_reason?: string | null
        moderated_at?: string | null
        moderated_by?: string | null
      }
      Update: {
        id?: number
        name?: string
        description?: string | null
        created_at?: string
        user_id?: string | null
        rating?: number | null
        is_favorite?: boolean | null
        is_flagged?: boolean | null
        flag_reason?: string | null
        moderated_at?: string | null
        moderated_by?: string | null
      }
    }
  }
}