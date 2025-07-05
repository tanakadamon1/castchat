-- Debug user creation trigger with detailed error logging

-- Create function to handle new user creation with detailed debugging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_val TEXT;
  display_name_val TEXT;
  avatar_url_val TEXT;
  debug_info JSONB;
BEGIN
  -- Log the incoming data
  debug_info := jsonb_build_object(
    'user_id', NEW.id,
    'email', NEW.email,
    'raw_user_meta_data', NEW.raw_user_meta_data,
    'app_metadata', NEW.app_metadata,
    'created_at', NEW.created_at
  );
  
  RAISE LOG 'handle_new_user called with: %', debug_info;
  
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

  RAISE LOG 'Generated values - username: %, display_name: %, avatar_url: %', 
    username_val, display_name_val, avatar_url_val;

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
  
  RAISE LOG 'Successfully inserted user profile for user_id: %', NEW.id;
  RETURN NEW;
  
EXCEPTION
  WHEN unique_violation THEN
    RAISE LOG 'Unique violation for username: %. Trying with different suffix...', username_val;
    
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
    
    RAISE LOG 'Successfully inserted user profile with new username: % for user_id: %', username_val, NEW.id;
    RETURN NEW;
    
  WHEN OTHERS THEN
    -- Log detailed error information
    RAISE LOG 'Error in handle_new_user for user_id %: %', NEW.id, SQLERRM;
    RAISE LOG 'Error details - SQLSTATE: %, SQLERRM: %', SQLSTATE, SQLERRM;
    RAISE LOG 'Generated values that failed - username: %, display_name: %, avatar_url: %', 
      username_val, display_name_val, avatar_url_val;
    
    -- Re-raise the error with more context
    RAISE EXCEPTION 'Failed to create user profile for user_id %: % (SQLSTATE: %)', 
      NEW.id, SQLERRM, SQLSTATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS policies are correct
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop and recreate all policies
DROP POLICY IF EXISTS "Service role full access" ON public.users;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Service role can do anything (for triggers)
CREATE POLICY "Service role full access" ON public.users
  FOR ALL USING (auth.role() = 'service_role');

-- Users can view all profiles
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (for triggers)
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant necessary permissions to the function
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON public.users TO service_role; 