# データベースマイグレーション手順

## Googleログインエラーの修正

Googleアカウントでログインしようとすると「Database error saving new user」エラーが発生する問題を修正します。

### 原因
auth.usersテーブルに新規ユーザーが作成された際に、public.usersテーブルにプロファイルを自動作成するトリガーが存在していませんでした。

### 修正手順

1. **Supabaseダッシュボードにログイン**
   - https://app.supabase.com にアクセス
   - プロジェクトを選択

2. **SQL Editorを開く**
   - 左側のメニューから「SQL Editor」を選択

3. **マイグレーションSQLを実行**
   - 以下のSQLを新規クエリとして貼り付けて実行：

```sql
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
```

4. **実行確認**
   - 「Run」ボタンをクリック
   - 成功メッセージが表示されることを確認

5. **テスト**
   - アプリケーションに戻ってGoogleログインを再度試す
   - 正常にログインできることを確認

### 注意事項
- このマイグレーションは既存のauth.usersに対してもプロファイルを作成します
- ユーザー名は自動生成されますが、後でプロファイル編集から変更可能です

## アイコンエラーの修正

manifest.webmanifestのアイコンパスエラーについては、次回のビルドで自動的に修正されます。

### ローカルでビルドする場合
```bash
npm run build
```

### 本番環境の場合
デプロイ時に新しいvite.config.tsの設定が適用され、アイコンパスが正しく設定されます。