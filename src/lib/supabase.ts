import { createClient } from '@supabase/supabase-js'

// Mengambil URL & Anon Key dari environment variables (Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Warning: Supabase URL atau Anon Key belum dikonfigurasi di file .env / .env.local'
  )
}

// Inisialisasi Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
