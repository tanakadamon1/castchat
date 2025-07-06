<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          特定商取引法に基づく表記
        </h1>
        <p class="text-gray-600 dark:text-gray-400">最終更新日：{{ formatDate(lastUpdated) }}</p>
      </div>

      <!-- Content -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-8">
        <div class="prose dark:prose-invert max-w-none">
          <!-- サービス内容 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              サービス内容
            </h2>
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="font-medium text-gray-900 dark:text-gray-100">提供サービス</div>
                <div class="md:col-span-2 text-gray-700 dark:text-gray-300">
                  VRChatキャスト募集・応募マッチングプラットフォームの提供
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="font-medium text-gray-900 dark:text-gray-100">サービス内容</div>
                <div class="md:col-span-2 text-gray-700 dark:text-gray-300">
                  <ul class="list-disc list-inside space-y-1">
                    <li>キャスト募集投稿の作成・管理</li>
                    <li>募集への応募機能</li>
                    <li>ユーザー間のコミュニケーション支援</li>
                    <li>プロフィール管理</li>
                    <li>応募・採用管理</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <!-- 料金について -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              料金について
            </h2>
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="font-medium text-gray-900 dark:text-gray-100">基本料金</div>
                <div class="md:col-span-2 text-gray-700 dark:text-gray-300">
                  無料（基本機能の利用）
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="font-medium text-gray-900 dark:text-gray-100">有料サービス</div>
                <div class="md:col-span-2 text-gray-700 dark:text-gray-300">
                  <div
                    class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                  >
                    <p class="text-sm text-blue-800 dark:text-blue-200">
                      現在、有料サービスは提供しておりません。<br />
                      将来的に有料機能を追加する場合は、事前にお知らせいたします。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 支払い方法 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">支払い方法</h2>
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="font-medium text-gray-900 dark:text-gray-100">決済方法</div>
                <div class="md:col-span-2 text-gray-700 dark:text-gray-300">
                  <div
                    class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                  >
                    <p class="text-sm text-blue-800 dark:text-blue-200">
                      現在、有料サービスは提供しておりませんので、決済は発生いたしません。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 申込の有効期限 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              申込の有効期限
            </h2>
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="font-medium text-gray-900 dark:text-gray-100">有効期限</div>
                <div class="md:col-span-2 text-gray-700 dark:text-gray-300">
                  申込後、即座にアカウントが有効になります。<br />
                  利用期限は設定されておりません。
                </div>
              </div>
            </div>
          </section>

          <!-- 引渡し時期 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              サービス提供時期
            </h2>
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="font-medium text-gray-900 dark:text-gray-100">サービス開始</div>
                <div class="md:col-span-2 text-gray-700 dark:text-gray-300">
                  アカウント登録完了後、即座にサービスをご利用いただけます。
                </div>
              </div>
            </div>
          </section>

          <!-- 返品・キャンセル -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              返品・キャンセルについて
            </h2>
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="font-medium text-gray-900 dark:text-gray-100">返品・返金</div>
                <div class="md:col-span-2 text-gray-700 dark:text-gray-300">
                  <div
                    class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                  >
                    <p class="text-sm text-blue-800 dark:text-blue-200">
                      現在、有料サービスは提供しておりませんので、返品・返金の対象となる取引はございません。<br />
                      アカウントの削除は、プロフィール設定からいつでも実行できます。
                    </p>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="font-medium text-gray-900 dark:text-gray-100">アカウント削除</div>
                <div class="md:col-span-2 text-gray-700 dark:text-gray-300">
                  利用者はいつでもアカウントを削除できます。<br />
                  削除後のデータ復旧はできませんのでご注意ください。
                </div>
              </div>
            </div>
          </section>

          <!-- 免責事項 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">免責事項</h2>
            <div class="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                本サービスは、VRChatキャスト募集のマッチングプラットフォームを提供するものであり、
                実際の取引や契約の成立について保証するものではありません。
              </p>
              <p>
                利用者間のトラブルについては、当事者間で解決していただくものとし、
                当運営者は一切の責任を負いません。
              </p>
              <p>サービスの利用により生じた損害について、当運営者は責任を負いかねます。</p>
            </div>
          </section>

          <!-- 個人情報の取扱い -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              個人情報の取扱い
            </h2>
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="font-medium text-gray-900 dark:text-gray-100">個人情報保護</div>
                <div class="md:col-span-2 text-gray-700 dark:text-gray-300">
                  取得した個人情報は、
                  <router-link
                    to="/privacy-policy"
                    class="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    プライバシーポリシー
                  </router-link>
                  に従って適切に管理いたします。
                </div>
              </div>
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
    day: 'numeric',
  })
}
</script>
