-- Enhanced debug trigger with step-by-step logging

-- Create function to handle new user creation with enhanced debugging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_val TEXT;
  display_name_val TEXT;
  avatar_url_val TEXT;
  debug_info JSONB;
  step_counter INTEGER := 0;
BEGIN
  step_counter := step_counter + 1;
  RAISE LOG '=== Step %: handle_new_user started ===', step_counter;
  
  -- Step 1: Log the incoming data
  step_counter := step_counter + 1;
  debug_info := jsonb_build_object(
    'user_id', NEW.id,
    'email', NEW.email,
    'raw_user_meta_data', NEW.raw_user_meta_data,
    'app_metadata', NEW.app_metadata,
    'created_at', NEW.created_at
  );
  
  RAISE LOG '=== Step %: Input data logged ===', step_counter;
  RAISE LOG 'Input data: %', debug_info;
  
  -- Step 2: Generate username
  step_counter := step_counter + 1;
  RAISE LOG '=== Step %: Generating username ===', step_counter;
  
  username_val := COALESCE(
    NEW.raw_user_meta_data->>'preferred_username',
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1) || '_' || substr(md5(random()::text), 1, 6)
  );
  
  RAISE LOG 'Generated username: %', username_val;
  
  -- Step 3: Generate display name
  step_counter := step_counter + 1;
  RAISE LOG '=== Step %: Generating display name ===', step_counter;
  
  display_name_val := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  
  RAISE LOG 'Generated display_name: %', display_name_val;
  
  -- Step 4: Get avatar URL
  step_counter := step_counter + 1;
  RAISE LOG '=== Step %: Getting avatar URL ===', step_counter;
  
  avatar_url_val := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );
  
  RAISE LOG 'Generated avatar_url: %', avatar_url_val;

  -- Step 5: Check if user already exists
  step_counter := step_counter + 1;
  RAISE LOG '=== Step %: Checking if user already exists ===', step_counter;
  
  IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    RAISE LOG 'User already exists in public.users, skipping insertion';
    RETURN NEW;
  END IF;
  
  -- Step 6: Insert into public.users
  step_counter := step_counter + 1;
  RAISE LOG '=== Step %: Inserting into public.users ===', step_counter;
  RAISE LOG 'Insert values - id: %, username: %, display_name: %, avatar_url: %', 
    NEW.id, username_val, display_name_val, avatar_url_val;

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
  
  step_counter := step_counter + 1;
  RAISE LOG '=== Step %: Successfully inserted user profile for user_id: % ===', step_counter, NEW.id;
  RETURN NEW;
  
EXCEPTION
  WHEN unique_violation THEN
    step_counter := step_counter + 1;
    RAISE LOG '=== Step %: Unique violation for username: %. Trying with different suffix... ===', step_counter, username_val;
    
    -- If username already exists, try with a different suffix
    username_val := split_part(NEW.email, '@', 1) || '_' || substr(md5(random()::text), 1, 8);
    
    RAISE LOG 'New username: %', username_val;
    
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
    
    step_counter := step_counter + 1;
    RAISE LOG '=== Step %: Successfully inserted user profile with new username: % for user_id: % ===', step_counter, username_val, NEW.id;
    RETURN NEW;
    
  WHEN OTHERS THEN
    -- Log detailed error information
    RAISE LOG '=== ERROR in handle_new_user for user_id % ===', NEW.id;
    RAISE LOG 'Error details - SQLSTATE: %, SQLERRM: %', SQLSTATE, SQLERRM;
    RAISE LOG 'Generated values that failed - username: %, display_name: %, avatar_url: %', 
      username_val, display_name_val, avatar_url_val;
    RAISE LOG 'Current step: %', step_counter;
    
    -- Re-raise the error with more context
    RAISE EXCEPTION 'Failed to create user profile for user_id % at step %: % (SQLSTATE: %)', 
      NEW.id, step_counter, SQLERRM, SQLSTATE;
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

-- Test the function manually
DO $$
DECLARE
  test_result TEXT;
BEGIN
  RAISE LOG '=== Testing handle_new_user function ===';
  
  -- Test with sample data
  SELECT public.handle_new_user() INTO test_result FROM (
    SELECT 
      '00000000-0000-0000-0000-000000000001'::uuid as id,
      'test@example.com' as email,
      '{"name": "Test User", "full_name": "Test User", "avatar_url": null}'::jsonb as raw_user_meta_data,
      '{}'::jsonb as app_metadata,
      NOW() as created_at
  ) AS test_data;
  
  RAISE LOG 'Test result: %', test_result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Test failed: %', SQLERRM;
END $$; 