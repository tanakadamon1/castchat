-- Fix user creation trigger to resolve "Database error saving new user"

-- Create function to handle new user creation with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_val TEXT;
  display_name_val TEXT;
  avatar_url_val TEXT;
BEGIN
  -- Generate username with better uniqueness handling
  username_val := COALESCE(
    NEW.raw_user_meta_data->>'preferred_username',
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1) || '_' || substr(md5(random()::text), 1, 6)
  );
  
  -- Generate display name
  display_name_val := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Get avatar URL
  avatar_url_val := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );

  -- Insert into public.users with better error handling
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
    username_val,
    display_name_val,
    avatar_url_val,
    '', -- bio
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
    username_val := split_part(NEW.email, '@', 1) || '_' || substr(md5(random()::text), 1, 8);
    
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
      username_val,
      display_name_val,
      avatar_url_val,
      '', -- bio
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
  WHEN OTHERS THEN
    -- Log the error and re-raise
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RAISE;
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
SELECT 
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'preferred_username',
    au.raw_user_meta_data->>'username',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1) || '_' || substr(md5(random()::text), 1, 6)
  ),
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1)
  ),
  COALESCE(
    au.raw_user_meta_data->>'avatar_url',
    au.raw_user_meta_data->>'picture'
  ),
  '', -- bio
  NULL, -- vrchat_username
  NULL, -- twitter_username
  NULL, -- discord_username
  NULL, -- website_url
  'user', -- role
  false, -- is_verified
  au.created_at,
  au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Update RLS policies for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Service role full access" ON public.users;

-- Policy: Users can view all profiles
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile (for triggers)
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Service role can do anything (for triggers)
CREATE POLICY "Service role full access" ON public.users
  FOR ALL USING (auth.role() = 'service_role'); 