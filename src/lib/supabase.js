import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL').trim()
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY').trim()

console.log("Supabase URL loaded:", supabaseUrl ? 'Yes' : 'No', "Key loaded:", supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' ? 'Yes' : 'No')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)