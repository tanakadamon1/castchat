<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          プライバシーポリシー
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          最終更新日：{{ formatDate(lastUpdated) }}
        </p>
      </div>

      <!-- Content -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-8">
        <div class="prose dark:prose-invert max-w-none">
          
          <!-- 基本方針 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              基本方針
            </h2>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              CastChat（以下「本サービス」といいます）は、ユーザーの皆様のプライバシーを尊重し、個人情報の保護に努めています。
              本プライバシーポリシーは、本サービスにおける個人情報の取り扱いについて説明します。
            </p>
          </section>

          <!-- 収集する情報 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              収集する情報
            </h2>
            
            <h3 class="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
              アカウント情報
            </h3>
            <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-1">
              <li>Googleアカウントから提供される基本情報（名前、メールアドレス、プロフィール画像）</li>
              <li>ユーザーが設定する表示名やプロフィール情報</li>
              <li>アカウント作成日時とログイン履歴</li>
            </ul>

            <h3 class="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
              投稿・活動情報
            </h3>
            <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-1">
              <li>投稿した募集内容、説明文、画像</li>
              <li>応募時のメッセージや経験・スキル情報</li>
              <li>投稿への応募履歴や承認・却下の状況</li>
            </ul>

            <h3 class="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
              技術情報
            </h3>
            <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-1">
              <li>IPアドレス、ブラウザの種類とバージョン</li>
              <li>アクセス日時、リファラー情報</li>
              <li>クッキーや類似の技術による情報</li>
            </ul>
          </section>

          <!-- 情報の使用目的 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              情報の使用目的
            </h2>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              収集した個人情報は、以下の目的で使用します：
            </p>
            <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
              <li>サービスの提供・運営・改善</li>
              <li>ユーザー認証とアカウント管理</li>
              <li>投稿内容の管理と表示</li>
              <li>ユーザー間のマッチングとコミュニケーション支援</li>
              <li>不正利用の防止とセキュリティ向上</li>
              <li>利用統計の作成（個人を特定しない形式）</li>
              <li>重要なお知らせやサービス変更の通知</li>
            </ul>
          </section>

          <!-- 情報の開示・共有 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              情報の開示・共有
            </h2>
            
            <h3 class="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
              一般的な共有
            </h3>
            <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-1">
              <li>投稿者の表示名とプロフィール情報は、他のユーザーに公開されます</li>
              <li>投稿内容は、サービス内で他のユーザーに表示されます</li>
              <li>応募情報は、該当する投稿の作成者にのみ開示されます</li>
            </ul>

            <h3 class="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
              第三者への開示
            </h3>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              以下の場合を除き、ユーザーの同意なく第三者に個人情報を開示することはありません：
            </p>
            <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
              <li>法令に基づく場合</li>
              <li>人の生命、身体または財産の保護のために必要がある場合</li>
              <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合</li>
              <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合</li>
            </ul>
          </section>

          <!-- セキュリティ対策 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              セキュリティ対策
            </h2>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              お預かりした個人情報の安全性を確保するため、以下の対策を実施しています：
            </p>
            <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
              <li>SSL/TLS暗号化通信による通信内容の保護</li>
              <li>データベースのアクセス制御と暗号化</li>
              <li>行レベルセキュリティ（RLS）による適切なアクセス権限の管理</li>
              <li>OAuth 2.0による安全な認証システム</li>
              <li>定期的なセキュリティ監査とシステム更新</li>
              <li>不正アクセス監視システムの導入</li>
            </ul>
          </section>

          <!-- データの保存期間 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              データの保存期間
            </h2>
            <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
              <li>アカウント情報：アカウント削除まで</li>
              <li>投稿内容：投稿削除または法的要請があるまで</li>
              <li>ログ情報：最大90日間</li>
              <li>削除されたデータのバックアップ：30日以内に完全削除</li>
            </ul>
          </section>

          <!-- ユーザーの権利 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              ユーザーの権利
            </h2>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              ユーザーは以下の権利を有します：
            </p>
            <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
              <li>自身の個人情報の確認・修正</li>
              <li>投稿や応募の削除</li>
              <li>アカウントの削除（個人情報の完全削除）</li>
              <li>個人情報の利用停止の要求</li>
            </ul>
          </section>

          <!-- クッキーの使用 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              クッキーの使用
            </h2>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              本サービスでは、以下の目的でクッキーを使用します：
            </p>
            <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
              <li>ログイン状態の維持</li>
              <li>ユーザー設定の保存（テーマ設定など）</li>
              <li>サービス利用状況の分析</li>
            </ul>
          </section>

          <!-- 外部サービス -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              外部サービスの利用
            </h2>
            <h3 class="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
              Google OAuth
            </h3>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              認証にGoogleのOAuthサービスを利用しています。
              Googleのプライバシーポリシーについては、
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" 
                 class="text-indigo-600 dark:text-indigo-400 hover:underline">
                Googleプライバシーポリシー
              </a>をご確認ください。
            </p>

            <h3 class="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
              Supabase
            </h3>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              データベースとバックエンドサービスにSupabaseを利用しています。
              Supabaseのプライバシーポリシーについては、
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer"
                 class="text-indigo-600 dark:text-indigo-400 hover:underline">
                Supabaseプライバシーポリシー
              </a>をご確認ください。
            </p>
          </section>

          <!-- ポリシーの変更 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              プライバシーポリシーの変更
            </h2>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              本プライバシーポリシーは、法令の改正やサービス内容の変更に応じて更新することがあります。
              重要な変更がある場合は、サービス内でお知らせいたします。
              継続してサービスをご利用いただくことで、変更後のプライバシーポリシーに同意したものとみなします。
            </p>
          </section>

          <!-- お問い合わせ -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              お問い合わせ
            </h2>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              プライバシーポリシーに関するご質問やご意見、個人情報の取り扱いに関するお問い合わせは、
              サービス内のお問い合わせフォームまたは以下の方法でご連絡ください。
            </p>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                お問い合わせについては、今後専用の連絡先を設置予定です。
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 最終更新日
const lastUpdated = ref('2025-01-06')

// 日付フォーマット関数
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>