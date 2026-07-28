-- Copia y pega esto en el SQL Editor de tu Dashboard de Supabase y haz clic en "Run"

CREATE TABLE IF NOT EXISTS progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  module_name TEXT NOT NULL,
  score NUMERIC,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configurar Row Level Security (RLS) para que los usuarios solo puedan ver/escribir su propia data
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver su propio progreso" 
ON progress FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar su propio progreso" 
ON progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);
