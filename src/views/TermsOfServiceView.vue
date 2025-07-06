<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          利用規約
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          最終更新日：{{ formatDate(lastUpdated) }}
        </p>
      </div>

      <!-- Content -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-8">
        <div class="prose dark:prose-invert max-w-none">
          
          <!-- 第1条：総則 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              第1条（総則）
            </h2>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              本利用規約（以下「本規約」といいます）は、CastChat（以下「本サービス」といいます）の利用に関する条件を定めるものです。
              本サービスをご利用いただく全てのユーザー（以下「利用者」といいます）は、本規約に同意したものとみなします。
            </p>
          </section>

          <!-- 第2条：サービス内容 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              第2条（サービス内容）
            </h2>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              本サービスは、VRChatにおけるキャスト募集・応募のマッチングプラットフォームを提供します。
              具体的には以下の機能を提供いたします：
            </p>
            <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
              <li>キャスト募集投稿の作成・管理機能</li>
              <li>募集への応募機能</li>
              <li>ユーザー間のコミュニケーション支援機能</li>
              <li>プロフィール管理機能</li>
              <li>応募・採用管理機能</li>
            </ul>
          </section>

          <!-- 第3条：利用登録 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              第3条（利用登録）
            </h2>
            <div class="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                本サービスの利用を希望する者は、本規約に同意の上、所定の方法により利用登録を申請し、
                当運営者がこれを承認することによって利用登録が完了します。
              </p>
              <p>
                利用登録の申請に際し、申請者は真実、正確かつ最新の情報を提供しなければなりません。
              </p>
              <p>
                以下のいずれかに該当する場合、利用登録を拒否することがあります：
              </p>
              <ul class="list-disc list-inside space-y-1">
                <li>本規約に違反するおそれがあると判断される場合</li>
                <li>反社会的勢力等であるか、または関係を有すると判断される場合</li>
                <li>登録希望者が未成年者、成年被後見人、被保佐人または被補助人のいずれかであり、法定代理人の同意等を得ていない場合</li>
                <li>過去に本サービスの利用を停止されたことがある場合</li>
                <li>その他、当運営者が利用登録を適当でないと判断した場合</li>
              </ul>
            </div>
          </section>

          <!-- 第4条：禁止事項 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              第4条（禁止事項）
            </h2>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              利用者は、本サービスの利用にあたり、以下の行為をしてはなりません：
            </p>
            <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>本サービスの内容等、本サービスに含まれる著作権、商標権その他の知的財産権を侵害する行為</li>
              <li>他の利用者、第三者、または当運営者の名誉または信用を毀損する行為</li>
              <li>他の利用者、第三者、または当運営者に不利益、損害、不快感を与える行為</li>
              <li>虚偽の情報を登録する行為</li>
              <li>営利、非営利を問わず、無許可で本サービスを商用利用する行為</li>
              <li>本サービスの運営を妨害するおそれのある行為</li>
              <li>不正アクセスをし、またはこれを試みる行為</li>
              <li>逆アセンブル、逆コンパイル、リバースエンジニアリング等によって本サービスのソースコードを解析する行為</li>
              <li>本サービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
              <li>宗教活動または宗教団体への勧誘行為</li>
              <li>その他、当運営者が不適切と判断する行為</li>
            </ul>
          </section>

          <!-- 第5条：投稿内容 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              第5条（投稿内容）
            </h2>
            <div class="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                利用者が本サービスに投稿するコンテンツ（文章、画像、その他のデータを含みます）については、
                利用者が自己の責任において投稿するものとします。
              </p>
              <p>
                投稿内容について、以下の場合には、事前の通知なく削除することがあります：
              </p>
              <ul class="list-disc list-inside space-y-1">
                <li>本規約に違反すると判断される場合</li>
                <li>第三者の権利を侵害すると判断される場合</li>
                <li>公序良俗に反すると判断される場合</li>
                <li>本サービスの運営に支障をきたすと判断される場合</li>
                <li>その他、当運営者が不適切と判断した場合</li>
              </ul>
            </div>
          </section>

          <!-- 第6条：利用制限および利用停止 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              第6条（利用制限および利用停止）
            </h2>
            <div class="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                当運営者は、利用者が以下のいずれかに該当する場合には、事前の通知なく、
                投稿データの削除、利用制限、または利用停止等の措置を講ずることができます：
              </p>
              <ul class="list-disc list-inside space-y-1">
                <li>本規約のいずれかの条項に違反した場合</li>
                <li>登録事項に虚偽の事実があることが判明した場合</li>
                <li>料金等の支払債務の不履行があった場合</li>
                <li>当運営者からの連絡に対し、合理的な期間内に応答がない場合</li>
                <li>本サービスについて、最終の利用から一定期間利用がない場合</li>
                <li>その他、当運営者が本サービスの利用を適当でないと判断した場合</li>
              </ul>
            </div>
          </section>

          <!-- 第7条：保証の否認および免責事項 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              第7条（保証の否認および免責事項）
            </h2>
            <div class="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                当運営者は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、
                有効性、特定の目的への適合性、セキュリティホールその他のウイルス等の欠陥、
                エラーやバグ、権利侵害等を含みます）がないことを明示的にも黙示的にも保証しておりません。
              </p>
              <p>
                当運営者は、本サービスに起因して利用者に生じたあらゆる損害について、
                一切の責任を負いません。ただし、本サービスに関する当運営者と利用者との間の契約
                （本規約を含みます）が消費者契約法に定める消費者契約となる場合、この免責規定は適用されません。
              </p>
            </div>
          </section>

          <!-- 第8条：サービス内容の変更等 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              第8条（サービス内容の変更等）
            </h2>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              当運営者は、利用者への事前の告知をもって、本サービスの内容を変更、追加または廃止することがあり、
              利用者はこれに同意するものとします。
            </p>
          </section>

          <!-- 第9条：利用規約の変更 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              第9条（利用規約の変更）
            </h2>
            <div class="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                当運営者は以下の場合には、利用者の個別の同意を要せず、本規約を変更することができるものとします：
              </p>
              <ul class="list-disc list-inside space-y-1">
                <li>本規約の変更が利用者の一般の利益に適合するとき</li>
                <li>本規約の変更が本サービス利用契約の目的に反せず、かつ、変更の必要性、変更後の内容の相当性その他の変更に係る事情に照らして合理的なものであるとき</li>
              </ul>
              <p>
                当運営者はあらかじめ、本規約を変更する旨および変更後の本規約の内容並びにその効力発生時期を、
                本サービス上での掲示その他の適切な方法により周知するものとします。
              </p>
            </div>
          </section>

          <!-- 第10条：個人情報の取扱い -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              第10条（個人情報の取扱い）
            </h2>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              当運営者は、本サービスの利用によって取得する個人情報については、
              当運営者のプライバシーポリシーに従い適切に取り扱うものとします。
            </p>
          </section>

          <!-- 第11条：通知または連絡 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              第11条（通知または連絡）
            </h2>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              利用者と当運営者との間の通知または連絡は、当運営者の定める方法によって行うものとします。
              当運営者は、利用者から、当運営者が別途定める方式に従った変更届け出がない限り、
              現在登録されている連絡先が有効なものとみなして当該連絡先へ通知または連絡を行い、
              これらは、発信時に利用者へ到達したものとみなします。
            </p>
          </section>

          <!-- 第12条：権利義務の譲渡の禁止 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              第12条（権利義務の譲渡の禁止）
            </h2>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              利用者は、当運営者の書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し、
              または担保に供することはできません。
            </p>
          </section>

          <!-- 第13条：適用法・裁判管轄 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              第13条（適用法・裁判管轄）
            </h2>
            <div class="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                本規約の解釈にあたっては、日本法を適用するものとします。
              </p>
              <p>
                本サービスに関して紛争が生じた場合には、当運営者の本店所在地を管轄する裁判所を専属的合意管轄とします。
              </p>
            </div>
          </section>

          <!-- 附則 -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              附則
            </h2>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              本規約は、{{ formatDate(lastUpdated) }}から施行するものとします。
            </p>
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