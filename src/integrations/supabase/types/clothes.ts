import { Json } from './auth'

export interface ClothesTypes {
  Tables: {
    clothes: {
      Row: {
        id: number
        created_at: string
        name: string
        category: string
        color: string
        image: string | null
        user_id: string | null
        subcategory: string | null
        brand: string | null
        secondary_color: string | null
        size: string | null
        material: string | null
        notes: string | null
        is_for_sale: boolean | null
        purchase_price: number | null
        selling_price: number | null
        location: string | null
        rating: number | null
      }
      Insert: {
        id?: never
        created_at?: string
        name: string
        category: string
        color: string
        image?: string | null
        user_id?: string | null
        subcategory?: string | null
        brand?: string | null
        secondary_color?: string | null
        size?: string | null
        material?: string | null
        notes?: string | null
        is_for_sale?: boolean | null
        purchase_price?: number | null
        selling_price?: number | null
        location?: string | null
        rating?: number | null
      }
      Update: {
        id?: never
        created_at?: string
        name?: string
        category?: string
        color?: string
        image?: string | null
        user_id?: string | null
        subcategory?: string | null
        brand?: string | null
        secondary_color?: string | null
        size?: string | null
        material?: string | null
        notes?: string | null
        is_for_sale?: boolean | null
        purchase_price?: number | null
        selling_price?: number | null
        location?: string | null
        rating?: number | null
      }
    }
    clothing_tags: {
      Row: {
        id: number
        name: string
        user_id: string | null
        created_at: string
      }
      Insert: {
        id?: never
        name: string
        user_id?: string | null
        created_at?: string
      }
      Update: {
        id?: never
        name?: string
        user_id?: string | null
        created_at?: string
      }
    }
    clothes_tags: {
      Row: {
        clothes_id: number
        tag_id: number
        created_at: string
      }
      Insert: {
        clothes_id: number
        tag_id: number
        created_at?: string
      }
      Update: {
        clothes_id?: number
        tag_id?: number
        created_at?: string
      }
    }
  }
}