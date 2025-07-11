# VRChatキャスト募集掲示板 追加画面ワイヤーフレーム

## 追加画面のワイヤーフレーム設計

### 6. 応募管理画面（主催者用） (/posts/:id/applications)

```
┌─────────────────────────────────────────────────────────────┐
│ [ロゴ] VRChatキャスト募集  [募集検索___________] [ユーザーメニュー] │
├─────────────────────────────────────────────────────────────┤
│ ← 募集詳細に戻る                                            │
├─────────────────────────────────────────────────────────────┤
│ # 「Spring Festival」応募者管理                             │
│                                                             │
│ 募集期間: 2024/03/01 - 2024/03/10  応募数: 24名  採用予定: 8名 │
│                                                             │
│ [ステータス別フィルター] [スキル別フィルター] [並び替え▼]     │
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                  │
│ │ 全て  │ │ 承認済み│ │ 保留中 │ │ 不採用 │                  │
│ │ (24)  │ │  (8)   │ │ (12)  │ │  (4)  │                  │
│ └───────┘ └───────┘ └───────┘ └───────┘                  │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [アバター] @username01                           [承認済み] │ │
│ │            応募日: 2024/03/05 14:30                     │ │
│ │            スキル: 司会・MC, イベント進行               │ │
│ │            評価: ★★★★★ 4.8 (45件)                   │ │
│ │            「ライブイベントの司会経験が豊富です...」     │ │
│ │            [詳細を見る] [メッセージ] [承認] [保留] [不採用] │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [アバター] @username02                           [保留中]  │ │
│ │            応募日: 2024/03/06 09:15                     │ │
│ │            スキル: 撮影サポート, 配信サポート           │ │
│ │            評価: ★★★★☆ 4.2 (23件)                   │ │
│ │            「初心者ですが頑張ります！」                 │ │
│ │            [詳細を見る] [メッセージ] [承認] [保留] [不採用] │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [アバター] @username03                           [不採用]  │ │
│ │            応募日: 2024/03/07 20:45                     │ │
│ │            スキル: なし                                 │ │
│ │            評価: ★★★☆☆ 3.1 (12件)                   │ │
│ │            「参加したいです」                           │ │
│ │            [詳細を見る] [メッセージ] [承認] [保留] [不採用] │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                    [もっと見る]                             │
│                                                             │
│ [一括操作] [選択した応募者に一括メッセージ] [CSV出力]       │
└─────────────────────────────────────────────────────────────┘
```

### 7. 応募履歴画面（応募者用） (/applications/history)

```
┌─────────────────────────────────────────────────────────────┐
│ [ロゴ] VRChatキャスト募集  [募集検索___________] [ユーザーメニュー] │
├─────────────────────────────────────────────────────────────┤
│ ← マイページに戻る                                          │
├─────────────────────────────────────────────────────────────┤
│ # 応募履歴                                                  │
│                                                             │
│ [ステータス別フィルター]                     合計: 15件の応募 │
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                  │
│ │ 全て  │ │ 採用  │ │ 選考中 │ │ 不採用 │                  │
│ │ (15)  │ │  (8)  │ │  (3)  │ │  (4)  │                  │
│ └───────┘ └───────┘ └───────┘ └───────┘                  │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 音楽ライブイベント「Spring Festival」              [採用] │ │
│ │ 応募日: 2024/03/05  結果通知: 2024/03/08              │ │
│ │ 開催日: 2024/03/15 20:00-22:00                        │ │
│ │ 主催者: @eventmaster                                   │ │
│ │ 報酬: 1,000円                                          │ │
│ │ [詳細を見る] [メッセージ履歴] [レビューを書く]          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ VTuberコラボ企画「新春特番」                    [選考中] │ │
│ │ 応募日: 2024/03/10  結果通知: 選考中                  │ │
│ │ 開催日: 2024/03/20 19:00-21:00                        │ │
│ │ 主催者: @vtuber_producer                               │ │
│ │ 報酬: 要相談                                           │ │
│ │ [詳細を見る] [メッセージ履歴] [応募を取り下げる]        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ワールド撮影会スタッフ募集                      [不採用] │ │
│ │ 応募日: 2024/02/28  結果通知: 2024/03/02              │ │
│ │ 開催日: 2024/03/05 18:00-20:00                        │ │
│ │ 主催者: @worldcreator                                  │ │
│ │ 報酬: 無償                                             │ │
│ │ [詳細を見る] [メッセージ履歴]                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                    [もっと見る]                             │
└─────────────────────────────────────────────────────────────┘
```

### 8. 通知画面 (/notifications)

```
┌─────────────────────────────────────────────────────────────┐
│ [ロゴ] VRChatキャスト募集  [募集検索___________] [ユーザーメニュー] │
├─────────────────────────────────────────────────────────────┤
│ ← 前のページに戻る                      [すべて既読にする] │
├─────────────────────────────────────────────────────────────┤
│ # 通知                                                      │
│                                                             │
│ [未読のみ] [すべて] [募集関連] [応募関連] [システム]         │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔴 [NEW] 応募が承認されました                            │ │
│ │      「Spring Festival」の司会として採用されました       │ │
│ │      2時間前 - @eventmaster                             │ │
│ │      [詳細を見る] [メッセージを確認]                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔴 [NEW] 新しい応募が届きました                          │ │
│ │      「VTuberコラボ企画」に@username04が応募しました     │ │
│ │      5時間前                                             │ │
│ │      [応募者管理] [プロフィールを見る]                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 💬 メッセージが届きました                                │ │
│ │    @eventmasterからメッセージが届いています              │ │
│ │    1日前                                                 │ │
│ │    [メッセージを確認]                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⭐ レビューのお願い                                      │ │
│ │    「Winter Concert」のレビューをお願いします            │ │
│ │    2日前 - @musicproducer                               │ │
│ │    [レビューを書く]                                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📢 システム通知                                          │ │
│ │    メンテナンスのお知らせ（3/20 2:00-4:00）             │ │
│ │    3日前 - システム                                      │ │
│ │    [詳細を見る]                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                    [もっと見る]                             │
└─────────────────────────────────────────────────────────────┘
```

### 9. お気に入り画面 (/favorites)

```
┌─────────────────────────────────────────────────────────────┐
│ [ロゴ] VRChatキャスト募集  [募集検索___________] [ユーザーメニュー] │
├─────────────────────────────────────────────────────────────┤
│ ← マイページに戻る                                          │
├─────────────────────────────────────────────────────────────┤
│ # お気に入り                                                │
│                                                             │
│ ┌─────────────┐ ┌─────────────┐                            │
│ │ お気に入り募集 │ │ フォロー中   │                            │
│ │     (12)      │ │     (8)     │                            │
│ └─────────────┘ └─────────────┘                            │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [画像] 音楽ライブイベント「Spring Festival」       [♡済] │ │
│ │        カテゴリ: ライブイベント 報酬: 1,000円          │ │
│ │        開催日: 2024/03/15 20:00-22:00                  │ │
│ │        募集人数: 8名 応募数: 24名                      │ │
│ │        主催者: @eventmaster ★4.8                      │ │
│ │        お気に入り登録日: 2024/03/01                    │ │
│ │        [詳細を見る] [お気に入り解除]                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [画像] VTuberコラボ企画「新春特番」             [♡済] │ │
│ │        カテゴリ: コラボ 報酬: 要相談                   │ │
│ │        開催日: 2024/03/20 19:00-21:00                  │ │
│ │        募集人数: 6名 応募数: 18名                      │ │
│ │        主催者: @vtuber_producer ★4.7                  │ │
│ │        お気に入り登録日: 2024/03/02                    │ │
│ │        [詳細を見る] [お気に入り解除]                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [画像] ワールド制作チーム募集                   [♡済] │ │
│ │        カテゴリ: ワールド制作 報酬: 売上の10%           │ │
│ │        開始予定: 2024/04/01                            │ │
│ │        募集人数: 3名 応募数: 8名                       │ │
│ │        主催者: @worldcreator ★4.9                     │ │
│ │        お気に入り登録日: 2024/03/05                    │ │
│ │        [詳細を見る] [お気に入り解除]                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                    [もっと見る]                             │
└─────────────────────────────────────────────────────────────┘
```

### 10. 設定画面 (/profile/settings)

```
┌─────────────────────────────────────────────────────────────┐
│ [ロゴ] VRChatキャスト募集  [募集検索___________] [ユーザーメニュー] │
├─────────────────────────────────────────────────────────────┤
│ ← プロフィールに戻る                                        │
├─────────────────────────────────────────────────────────────┤
│ # 設定                                                      │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ## アカウント設定                                       │ │
│ │                                                         │ │
│ │ メールアドレス                                          │ │
│ │ [user@example.com_________________] [変更]              │ │
│ │                                                         │ │
│ │ パスワード                                              │ │
│ │ [●●●●●●●●●●●●●●●●●●●●●●●●] [変更]              │ │
│ │                                                         │ │
│ │ VRChatユーザー名                                        │ │
│ │ [@vrchat_username________________] [更新]              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ## 通知設定                                             │ │
│ │                                                         │ │
│ │ ☑ 新しい応募があったときに通知                          │ │
│ │ ☑ 応募結果が決定したときに通知                          │ │
│ │ ☑ メッセージを受信したときに通知                        │ │
│ │ ☑ お気に入りの募集が更新されたときに通知                │ │
│ │ ☑ システムからの重要なお知らせ                          │ │
│ │                                                         │ │
│ │ 通知方法                                                │ │
│ │ ☑ ブラウザ通知                                          │ │
│ │ ☑ メール通知                                            │ │
│ │ □ Discord通知（連携設定が必要）                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ## プライバシー設定                                     │ │
│ │                                                         │ │
│ │ プロフィール公開設定                                    │ │
│ │ ○ 全ユーザーに公開                                     │ │
│ │ ○ 登録ユーザーのみに公開                               │ │
│ │ ○ 非公開                                               │ │
│ │                                                         │ │
│ │ 応募履歴の表示                                          │ │
│ │ ☑ 評価・レビューを公開                                  │ │
│ │ ☑ 参加実績数を公開                                      │ │
│ │ □ 具体的な参加イベント名を公開                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ## 外部連携                                             │ │
│ │                                                         │ │
│ │ Discord                    [未連携]  [連携する]         │ │
│ │ Twitter/X                  [連携済み] [連携解除]        │ │
│ │ VRChat API                 [未連携]  [連携する]         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ## 危険な操作                                           │ │
│ │                                                         │ │
│ │ [アカウントを削除する]                                  │ │
│ │ ※削除したアカウントは復旧できません                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                         [保存する]                          │
└─────────────────────────────────────────────────────────────┘
```

### 11. ヘルプ・FAQ画面 (/help/faq)

```
┌─────────────────────────────────────────────────────────────┐
│ [ロゴ] VRChatキャスト募集  [募集検索___________] [ユーザーメニュー] │
├─────────────────────────────────────────────────────────────┤
│ # ヘルプ・よくある質問                                      │
│                                                             │
│ [FAQ検索_________________________________] [🔍]           │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ## 目次                                                 │ │
│ │ ・はじめての方へ                                        │ │
│ │ ・募集について                                          │ │
│ │ ・応募について                                          │ │
│ │ ・支払い・報酬について                                  │ │
│ │ ・トラブル・安全性について                              │ │
│ │ ・アカウント・設定について                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ## よくある質問                                         │ │
│ │                                                         │ │
│ │ Q. このサービスは無料で使えますか？                     │ │
│ │ ▼ A. はい、基本機能は全て無料でご利用いただけます...    │ │
│ │                                                         │ │
│ │ Q. 応募したのに返事がありません                         │ │
│ │ ▼ A. 主催者によって選考期間が異なります...              │ │
│ │                                                         │ │
│ │ Q. 報酬の支払い方法について                             │ │
│ │ ▼ A. 報酬の支払いは主催者と応募者の間で...              │ │
│ │                                                         │ │
│ │ Q. 不適切な募集を見つけました                           │ │
│ │ ▼ A. 報告機能をご利用ください...                        │ │
│ │                                                         │ │
│ │ Q. VRChatアカウントとの連携は必須ですか？               │ │
│ │ ▼ A. 必須ではありませんが、連携することで...            │ │
│ │                                                         │ │
│ │ Q. 未成年でも利用できますか？                           │ │
│ │ ▼ A. 13歳以上の方であればご利用いただけますが...        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ## お困りの際は                                         │ │
│ │                                                         │ │
│ │ [お問い合わせフォーム] [コミュニティフォーラム]          │ │
│ │                                                         │ │
│ │ 緊急時・重要な報告                                      │ │
│ │ emergency@castchat.com                                  │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 12. エラー画面 (/404)

```
┌─────────────────────────────────────────────────────────────┐
│ [ロゴ] VRChatキャスト募集                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                        🔍 404                               │
│                                                             │
│                 ページが見つかりません                      │
│                                                             │
│         お探しのページは削除されたか、                      │
│         URL が変更された可能性があります。                  │
│                                                             │
│                  [ホームに戻る]                             │
│                                                             │
│                     または                                  │
│                                                             │
│   [募集を探す] [新規募集を投稿] [マイページ] [ヘルプ]       │
│                                                             │
│                                                             │
│         ┌─────────────────────────────────┐                 │
│         │ ## よく探されるページ           │                 │
│         │ ・新着募集一覧                  │                 │
│         │ ・人気のイベント                │                 │
│         │ ・使い方ガイド                  │                 │
│         │ ・よくある質問                  │                 │
│         └─────────────────────────────────┘                 │
│                                                             │
│                                                             │
│              問題が解決しない場合は                         │
│                [お問い合わせ]                               │
└─────────────────────────────────────────────────────────────┘
```

## 追加ワイヤーフレームの設計原則

### 一貫性の維持
- 既存の主要5画面と同じUIパターンを使用
- ナビゲーション構造の統一
- カラーシステム・タイポグラフィの適用

### 機能性重視
- 各画面の目的に応じた情報設計
- 効率的なデータ表示とアクション
- 適切なフィルタリング・ソート機能

### ユーザビリティ配慮
- 直感的な操作フロー
- 重要な情報の優先表示
- 適切なフィードバック表示

### レスポンシブ対応
- モバイルでの操作性を考慮
- 画面サイズに応じた情報の再配置
- タッチ操作に適したボタンサイズ

これで全画面のワイヤーフレームが完成しました。各画面は実際の利用シーンを想定した具体的な情報とインタラクションを含んでいます。