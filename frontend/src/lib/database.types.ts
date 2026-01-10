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
      users: {
        Row: {
          id: number
          email: string
          name: string
          business_name: string
          business_type: 'manufacturing' | 'service' | 'trading' | 'retail'
          created_at: string
        }
        Insert: {
          id?: number
          email: string
          name: string
          business_name: string
          business_type?: 'manufacturing' | 'service' | 'trading' | 'retail'
          created_at?: string
        }
        Update: {
          id?: number
          email?: string
          name?: string
          business_name?: string
          business_type?: 'manufacturing' | 'service' | 'trading' | 'retail'
          created_at?: string
        }
      }
      inventory: {
        Row: {
          id: number
          user_id: number
          sku: string
          name: string
          qty: number
          unit: string
          reorder_level: number
          lead_time_days: number
          unit_cost: number
          last_updated: string
        }
        Insert: {
          id?: number
          user_id: number
          sku: string
          name: string
          qty?: number
          unit?: string
          reorder_level?: number
          lead_time_days?: number
          unit_cost?: number
          last_updated?: string
        }
        Update: {
          id?: number
          user_id?: number
          sku?: string
          name?: string
          qty?: number
          unit?: string
          reorder_level?: number
          lead_time_days?: number
          unit_cost?: number
          last_updated?: string
        }
      }
      transactions: {
        Row: {
          id: number
          user_id: number
          date: string
          amount: number
          type: 'debit' | 'credit'
          category: string
          description: string | null
        }
        Insert: {
          id?: number
          user_id: number
          date: string
          amount: number
          type: 'debit' | 'credit'
          category?: string
          description?: string | null
        }
        Update: {
          id?: number
          user_id?: number
          date?: string
          amount?: number
          type?: 'debit' | 'credit'
          category?: string
          description?: string | null
        }
      }
      documents: {
        Row: {
          id: number
          user_id: number
          file_url: string
          file_name: string
          document_type: string | null
          extracted_json: Json | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          created_at: string
          processed_at: string | null
        }
        Insert: {
          id?: number
          user_id: number
          file_url: string
          file_name: string
          document_type?: string | null
          extracted_json?: Json | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          created_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: number
          user_id?: number
          file_url?: string
          file_name?: string
          document_type?: string | null
          extracted_json?: Json | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          created_at?: string
          processed_at?: string | null
        }
      }
      agent_logs: {
        Row: {
          id: number
          timestamp: string
          agent_name: string
          action: string
          result: string | null
          severity: 'info' | 'warning' | 'critical'
          extra_data: Json | null
        }
        Insert: {
          id?: number
          timestamp?: string
          agent_name: string
          action: string
          result?: string | null
          severity?: 'info' | 'warning' | 'critical'
          extra_data?: Json | null
        }
        Update: {
          id?: number
          timestamp?: string
          agent_name?: string
          action?: string
          result?: string | null
          severity?: 'info' | 'warning' | 'critical'
          extra_data?: Json | null
        }
      }
    }
  }
}
