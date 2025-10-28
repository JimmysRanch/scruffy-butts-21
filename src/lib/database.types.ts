/**
 * Database Types
 * 
 * These types are generated from the Supabase database schema.
 * To regenerate, run: npx supabase gen types typescript --project-id tuwkdsoiltdboiaghztz > src/lib/database.types.ts
 * 
 * Or for local development: npx supabase gen types typescript --local > src/lib/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          role: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          user_id: string | null
          first_name: string
          last_name: string
          email: string
          phone: string
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          first_name: string
          last_name: string
          email: string
          phone: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      pets: {
        Row: {
          id: string
          customer_id: string
          name: string
          breed: string
          size: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          name: string
          breed: string
          size?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          name?: string
          breed?: string
          size?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          name: string
          description: string | null
          duration: number
          price: number
          category: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          duration: number
          price: number
          category: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          duration?: number
          price?: number
          category?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      staff_members: {
        Row: {
          id: string
          user_id: string | null
          first_name: string
          last_name: string
          email: string
          phone: string
          position: string
          hire_date: string
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          specialties: string[]
          notes: string | null
          status: string
          rating: number
          color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          first_name: string
          last_name: string
          email: string
          phone: string
          position: string
          hire_date: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          specialties?: string[]
          notes?: string | null
          status?: string
          rating?: number
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          position?: string
          hire_date?: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          specialties?: string[]
          notes?: string | null
          status?: string
          rating?: number
          color?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          customer_id: string
          pet_id: string
          service_id: string
          staff_id: string | null
          appointment_date: string
          start_time: string
          end_time: string
          duration: number
          price: number
          status: string
          notes: string | null
          reminder_sent: boolean
          confirmation_sent: boolean
          pickup_notification_sent: boolean
          customer_arrived: boolean
          checked_in_at: string | null
          checked_out_at: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          customer_id: string
          pet_id: string
          service_id: string
          staff_id?: string | null
          appointment_date: string
          start_time: string
          end_time: string
          duration: number
          price: number
          status?: string
          notes?: string | null
          reminder_sent?: boolean
          confirmation_sent?: boolean
          pickup_notification_sent?: boolean
          customer_arrived?: boolean
          checked_in_at?: string | null
          checked_out_at?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          customer_id?: string
          pet_id?: string
          service_id?: string
          staff_id?: string | null
          appointment_date?: string
          start_time?: string
          end_time?: string
          duration?: number
          price?: number
          status?: string
          notes?: string | null
          reminder_sent?: boolean
          confirmation_sent?: boolean
          pickup_notification_sent?: boolean
          customer_arrived?: boolean
          checked_in_at?: string | null
          checked_out_at?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          customer_id: string | null
          appointment_id: string | null
          staff_id: string | null
          subtotal: number
          tax: number
          discount: number
          tip: number
          total: number
          payment_method: string
          transaction_date: string
          transaction_time: string
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          customer_id?: string | null
          appointment_id?: string | null
          staff_id?: string | null
          subtotal: number
          tax?: number
          discount?: number
          tip?: number
          total: number
          payment_method: string
          transaction_date?: string
          transaction_time?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          customer_id?: string | null
          appointment_id?: string | null
          staff_id?: string | null
          subtotal?: number
          tax?: number
          discount?: number
          tip?: number
          total?: number
          payment_method?: string
          transaction_date?: string
          transaction_time?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      transaction_items: {
        Row: {
          id: string
          transaction_id: string
          item_type: string
          item_id: string | null
          item_name: string
          quantity: number
          unit_price: number
          total_price: number
          is_original_appointment_service: boolean
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          item_type: string
          item_id?: string | null
          item_name: string
          quantity?: number
          unit_price: number
          total_price: number
          is_original_appointment_service?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          item_type?: string
          item_id?: string | null
          item_name?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          is_original_appointment_service?: boolean
          created_at?: string
        }
      }
      inventory_items: {
        Row: {
          id: string
          name: string
          category: string
          sku: string | null
          quantity: number
          unit: string
          reorder_level: number
          reorder_quantity: number
          cost_per_unit: number
          selling_price: number | null
          supplier: string | null
          notes: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          sku?: string | null
          quantity?: number
          unit?: string
          reorder_level?: number
          reorder_quantity?: number
          cost_per_unit?: number
          selling_price?: number | null
          supplier?: string | null
          notes?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          sku?: string | null
          quantity?: number
          unit?: string
          reorder_level?: number
          reorder_quantity?: number
          cost_per_unit?: number
          selling_price?: number | null
          supplier?: string | null
          notes?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      inventory_transactions: {
        Row: {
          id: string
          item_id: string
          transaction_type: string
          quantity: number
          previous_quantity: number
          new_quantity: number
          cost: number | null
          notes: string | null
          reference_id: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          item_id: string
          transaction_type: string
          quantity: number
          previous_quantity: number
          new_quantity: number
          cost?: number | null
          notes?: string | null
          reference_id?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          item_id?: string
          transaction_type?: string
          quantity?: number
          previous_quantity?: number
          new_quantity?: number
          cost?: number | null
          notes?: string | null
          reference_id?: string | null
          created_at?: string
          created_by?: string | null
        }
      }
      staff_schedules: {
        Row: {
          id: string
          staff_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          staff_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          staff_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      staff_time_off: {
        Row: {
          id: string
          staff_id: string
          start_date: string
          end_date: string
          reason: string | null
          status: string
          notes: string | null
          created_at: string
          updated_at: string
          approved_by: string | null
          approved_at: string | null
        }
        Insert: {
          id?: string
          staff_id: string
          start_date: string
          end_date: string
          reason?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
          approved_by?: string | null
          approved_at?: string | null
        }
        Update: {
          id?: string
          staff_id?: string
          start_date?: string
          end_date?: string
          reason?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
          approved_by?: string | null
          approved_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_appointment_conflict: {
        Args: {
          p_staff_id: string
          p_appointment_date: string
          p_start_time: string
          p_end_time: string
          p_appointment_id?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
