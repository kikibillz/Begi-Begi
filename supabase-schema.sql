-- ==========================================================
-- iBeg KINDNESS ECONOMY - SUPABASE SCHEMA
-- ==========================================================
-- INSTRUCTIONS:
-- 1. Go to your Supabase Project Dashboard
-- 2. Open the "SQL Editor" on the left sidebar
-- 3. Create a "New Query"
-- 4. Paste ALL the code below and click "Run"
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CREATE PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  points INTEGER DEFAULT 100, -- Starting gift
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. CREATE BEGS TABLE
CREATE TABLE IF NOT EXISTS public.begs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Items', 'Favors', 'Money', 'Experiences', 'Coffee', 'Help', 'Food')),
  image_url TEXT,
  points_reward INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'granted')),
  is_urgent BOOLEAN DEFAULT false,
  location TEXT,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Ensure columns exist if table was created before
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='begs' AND column_name='target_user_id') THEN
    ALTER TABLE public.begs ADD COLUMN target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='begs' AND column_name='granted_by') THEN
    ALTER TABLE public.begs ADD COLUMN granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. CREATE ACTIVITY HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.activity_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  granted_to TEXT,
  points INTEGER NOT NULL,
  type TEXT CHECK (type IN ('grant', 'creation')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  icon TEXT
);

-- 4. SET UP ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.begs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_history ENABLE ROW LEVEL SECURITY;

-- 5. DEFINE POLICIES
-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Begs Policies (Privacy Logic)
DROP POLICY IF EXISTS "Public begs are viewable by everyone" ON begs;
DROP POLICY IF EXISTS "Private begs are viewable by participants" ON begs;
DROP POLICY IF EXISTS "Users can create begs" ON begs;
DROP POLICY IF EXISTS "Users can update own begs" ON begs;
DROP POLICY IF EXISTS "Anyone can grant a beg" ON begs;
DROP POLICY IF EXISTS "Users can delete own begs" ON begs;

-- Public begs (pending or granted) are viewable by everyone if not targeted
CREATE POLICY "Public begs are viewable by everyone" ON begs FOR SELECT USING (target_user_id IS NULL);
-- Private/Targeted begs are only for the creator and target
CREATE POLICY "Private begs are viewable by participants" ON begs FOR SELECT USING (auth.uid() = user_id OR auth.uid() = target_user_id);
CREATE POLICY "Users can create begs" ON begs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own begs" ON begs FOR UPDATE USING (auth.uid() = user_id);
-- Allow anyone to update the status to 'granted' if it's currently 'pending' (anyone can help)
-- Crucial: Ensure they can only set themselves as the 'granted_by' user
CREATE POLICY "Anyone can grant a beg" ON begs FOR UPDATE USING (status = 'pending') WITH CHECK (status = 'granted' AND (granted_by IS NULL OR granted_by = auth.uid()));
CREATE POLICY "Users can delete own begs" ON begs FOR DELETE USING (auth.uid() = user_id);

-- Activity History Policies
DROP POLICY IF EXISTS "Users can view own history" ON activity_history;
DROP POLICY IF EXISTS "Users can insert own history" ON activity_history;

CREATE POLICY "Users can view own history" ON activity_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON activity_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE begs;

-- 7. AUTOMATIC PROFILE CREATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, points, level, xp)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id),
    100, -- Gift points
    1,
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. ATOMIC INCREMENT FUNCTION WITH LEVEL UP LOGIC
CREATE OR REPLACE FUNCTION increment_user_points(user_id UUID, amount INTEGER, xp_amount INTEGER)
RETURNS VOID AS $$
DECLARE
    final_xp INTEGER;
    current_lvl INTEGER;
BEGIN
  UPDATE profiles
  SET points = COALESCE(points, 0) + amount,
      xp = COALESCE(xp, 0) + xp_amount
  WHERE id = user_id
  RETURNING xp, level INTO final_xp, current_lvl;

  -- Level up every 1000 XP
  IF final_xp >= (current_lvl * 1000) THEN
    UPDATE profiles
    SET level = current_lvl + 1
    WHERE id = user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
