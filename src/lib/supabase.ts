import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables are missing!');
    // Return a dummy client or throw a descriptive error that we can catch
  }

  return createBrowserClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
  )
}
