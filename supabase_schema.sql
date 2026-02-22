-- =============================================
-- MASTER CARPINTERÍA — Supabase Schema
-- Ejecutar en el SQL Editor de Supabase
-- =============================================

-- 1. Profiles (perfil de usuario + respuestas de onboarding)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  onboarding_complete BOOLEAN DEFAULT false,
  hours_weekday NUMERIC(3,1),
  hours_weekend NUMERIC(4,1),
  space TEXT,
  budget INTEGER,
  experience TEXT,
  materials_access TEXT,
  layout_data JSONB DEFAULT '{}',
  current_phase INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1.1 Custom Steps (para planes personalizados)
CREATE TABLE IF NOT EXISTS custom_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'plan', 'taller', 'negocio'
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Goals (metas semanales)
CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phase INTEGER DEFAULT 1,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  week_target DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Weekly reviews (revisiones semanales)
CREATE TABLE IF NOT EXISTS weekly_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_date DATE NOT NULL,
  did TEXT,
  didnt_do TEXT,
  learned TEXT,
  blocked TEXT,
  ai_feedback TEXT,
  next_goals TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Chat messages (historial del chat con IA)
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Project steps (seguimiento de la mesa eterna)
CREATE TABLE IF NOT EXISTS project_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  title TEXT,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, project_name, step_number)
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_steps ENABLE ROW LEVEL SECURITY;

-- Policies: cada usuario solo ve sus propios datos
CREATE POLICY "Users see own profile" ON profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own custom steps" ON custom_steps FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own goals" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own reviews" ON weekly_reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own messages" ON chat_messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own steps" ON project_steps FOR ALL USING (auth.uid() = user_id);
