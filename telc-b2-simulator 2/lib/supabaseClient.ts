import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function saveProgress(moduleName: string, score: number | null, feedback: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data, error } = await supabase
    .from('progress')
    .insert([
      {
        user_id: session.user.id,
        module_name: moduleName,
        score: score,
        feedback: feedback,
      }
    ]);

  if (error) {
    console.error('Error saving progress:', error);
    return null;
  }
  return data;
}
