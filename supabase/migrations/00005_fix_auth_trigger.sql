-- Fix auth trigger for automatic user profile creation

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users with default values
  INSERT INTO public.users (
    id,
    username,
    display_name,
    avatar_url,
    bio,
    vrchat_username,
    twitter_username,
    discord_username,
    website_url,
    role,
    is_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    -- Generate unique username from email or provider data
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1) || '_' || substr(md5(random()::text), 1, 6)
    ),
    -- Display name from provider or email
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    -- Avatar URL from provider
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    -- Bio (empty by default)
    '',
    -- Social usernames (empty by default)
    NULL, -- vrchat_username
    NULL, -- twitter_username
    NULL, -- discord_username
    NULL, -- website_url
    'user', -- default role
    false, -- not verified by default
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If username already exists, try with a different suffix
    INSERT INTO public.users (
      id,
      username,
      display_name,
      avatar_url,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      split_part(NEW.email, '@', 1) || '_' || substr(md5(random()::text), 1, 8),
      COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
      ),
      COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture'
      ),
      NOW(),
      NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Fix any existing auth users that don't have profiles
INSERT INTO public.users (
  id,
  username,
  display_name,
  created_at,
  updated_at
)
SELECT 
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'username',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1) || '_' || substr(md5(random()::text), 1, 6)
  ),
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1)
  ),
  au.created_at,
  au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Add RLS policies for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all profiles
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Service role can do anything (for triggers)
CREATE POLICY "Service role full access" ON public.users
  USING (auth.role() = 'service_role');