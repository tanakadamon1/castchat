# SECURITY DEFINER ビューの修正手順

## 問題
Supabaseのデータベースリンターから以下の警告が発生:
- `applications_detail_view` ビューがSECURITY DEFINERプロパティを持っている
- `posts_with_valid_priority` ビューがSECURITY DEFINERプロパティを持っている

## 修正方法

### 1. 修正SQLファイルの実行
Supabase SQL Editorで以下のファイルを実行してください：

```sql
-- fix-security-definer-views.sql
```

### 2. 修正内容
- 既存のビューを削除してから通常のビューとして再作成
- SECURITY DEFINERを使用しない通常のビューに変更
- RLSポリシーは基底テーブルの設定を継承

### 3. セキュリティ対策
- ビューは基底テーブル（posts, applications）のRLSポリシーを継承
- 不必要な権限昇格を防止
- 通常のビューでも必要な機能は維持

### 4. 確認方法
修正後、以下のクエリで確認：

```sql
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE schemaname = 'public' 
  AND viewname IN ('posts_with_valid_priority', 'applications_detail_view');
```

## 影響
- 既存の機能には影響なし
- セキュリティが向上
- データベースリンターの警告が解消

## 注意事項
- 本修正は既存のアプリケーションロジックに影響しません
- RLSポリシーは基底テーブルの設定が適用されます
- 必要に応じて、アプリケーション側でのアクセス制御を確認してください