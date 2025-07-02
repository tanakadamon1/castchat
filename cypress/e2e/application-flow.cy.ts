// E2E テスト: 応募フロー
// Cypress統合テスト

describe('Application Flow', () => {
  beforeEach(() => {
    // テスト用データの準備
    cy.task('seedDatabase')
    
    // テストユーザーでログイン
    cy.login('applicant@example.com', 'password123')
  })

  afterEach(() => {
    // テスト後のクリーンアップ
    cy.task('cleanupDatabase')
  })

  describe('募集への応募', () => {
    it('募集詳細から応募ができる', () => {
      // 募集一覧を表示
      cy.visit('/posts')
      cy.get('[data-testid="posts-loading"]').should('not.exist')
      
      // 最初の募集をクリック
      cy.get('[data-testid="post-card"]').first().click()
      
      // 募集詳細ページが表示される
      cy.url().should('include', '/posts/')
      cy.get('[data-testid="post-title"]').should('be.visible')
      
      // 応募ボタンをクリック
      cy.get('[data-testid="apply-button"]').should('be.visible').click()
      
      // 応募モーダルが表示される
      cy.get('[data-testid="application-modal"]').should('be.visible')
      
      // 応募フォームに入力
      cy.get('[data-testid="application-message"]')
        .type('テスト応募メッセージです。経験豊富で、このプロジェクトに強い興味があります。')
      
      cy.get('[data-testid="experience-years"]').select('3')
      
      cy.get('[data-testid="availability"]')
        .type('平日夜間と週末が対応可能です。')
      
      cy.get('[data-testid="portfolio-url"]')
        .type('https://portfolio.example.com')
      
      // 応募を送信
      cy.get('[data-testid="submit-application"]').click()
      
      // 送信中の状態を確認
      cy.get('[data-testid="application-submitting"]').should('be.visible')
      
      // 応募完了の確認
      cy.get('[data-testid="application-success"]')
        .should('be.visible')
        .and('contain', '応募を送信しました')
      
      // モーダルが閉じる
      cy.get('[data-testid="application-modal"]').should('not.exist')
      
      // 応募ボタンが無効化される
      cy.get('[data-testid="apply-button"]')
        .should('be.disabled')
        .and('contain', '応募済み')
    })

    it('重複応募ができない', () => {
      // 既に応募済みの募集に移動
      cy.visit('/posts/existing-application-post')
      
      // 応募ボタンが無効化されている
      cy.get('[data-testid="apply-button"]')
        .should('be.disabled')
        .and('contain', '応募済み')
      
      // 応募済みメッセージが表示される
      cy.get('[data-testid="already-applied"]')
        .should('be.visible')
        .and('contain', '既に応募済みです')
    })

    it('未ログイン時はログインページへリダイレクト', () => {
      // ログアウト
      cy.logout()
      
      // 募集詳細ページに移動
      cy.visit('/posts/test-post-1')
      
      // 応募ボタンをクリック
      cy.get('[data-testid="apply-button"]').click()
      
      // ログインページへリダイレクト
      cy.url().should('include', '/login')
      
      // エラーメッセージが表示される
      cy.get('[data-testid="toast-error"]')
        .should('be.visible')
        .and('contain', 'ログインが必要です')
    })
  })

  describe('応募履歴の確認', () => {
    beforeEach(() => {
      // テスト応募データを作成
      cy.task('createTestApplications', { userId: 'test-user-id' })
    })

    it('応募履歴一覧を表示できる', () => {
      // プロフィールページに移動
      cy.visit('/profile')
      
      // 応募履歴タブをクリック
      cy.get('[data-testid="applications-tab"]').click()
      
      // 応募履歴が表示される
      cy.get('[data-testid="application-item"]').should('have.length.greaterThan', 0)
      
      // 応募項目の内容確認
      cy.get('[data-testid="application-item"]').first().within(() => {
        cy.get('[data-testid="post-title"]').should('be.visible')
        cy.get('[data-testid="application-status"]').should('be.visible')
        cy.get('[data-testid="application-date"]').should('be.visible')
      })
    })

    it('応募状況でフィルタリングできる', () => {
      cy.visit('/profile/applications')
      
      // ステータスフィルターを使用
      cy.get('[data-testid="status-filter"]').select('pending')
      
      // フィルタリングされた結果が表示される
      cy.get('[data-testid="application-item"]').each(($el) => {
        cy.wrap($el)
          .find('[data-testid="application-status"]')
          .should('contain', '審査中')
      })
    })

    it('応募詳細を表示できる', () => {
      cy.visit('/profile/applications')
      
      // 応募項目をクリック
      cy.get('[data-testid="application-item"]').first().click()
      
      // 応募詳細モーダルが表示される
      cy.get('[data-testid="application-detail-modal"]').should('be.visible')
      
      // 応募内容が表示される
      cy.get('[data-testid="application-message"]').should('be.visible')
      cy.get('[data-testid="application-timestamp"]').should('be.visible')
      cy.get('[data-testid="post-details"]').should('be.visible')
    })
  })

  describe('応募の取り消し', () => {
    it('審査中の応募を取り消せる', () => {
      cy.visit('/profile/applications')
      
      // 審査中の応募を選択
      cy.get('[data-testid="application-item"]')
        .contains('[data-testid="application-status"]', '審査中')
        .parent()
        .within(() => {
          cy.get('[data-testid="withdraw-button"]').click()
        })
      
      // 確認ダイアログが表示される
      cy.get('[data-testid="confirm-dialog"]')
        .should('be.visible')
        .and('contain', '応募を取り消しますか？')
      
      // 取り消しを確認
      cy.get('[data-testid="confirm-button"]').click()
      
      // 成功メッセージが表示される
      cy.get('[data-testid="toast-success"]')
        .should('be.visible')
        .and('contain', '応募を取り消しました')
      
      // ステータスが更新される
      cy.get('[data-testid="application-status"]')
        .should('contain', '取り消し済み')
    })

    it('承認済みの応募は取り消せない', () => {
      cy.visit('/profile/applications')
      
      // 承認済みの応募を確認
      cy.get('[data-testid="application-item"]')
        .contains('[data-testid="application-status"]', '承認済み')
        .parent()
        .within(() => {
          // 取り消しボタンが表示されない
          cy.get('[data-testid="withdraw-button"]').should('not.exist')
        })
    })
  })

  describe('募集者による応募管理', () => {
    beforeEach(() => {
      // 募集投稿者としてログイン
      cy.login('author@example.com', 'password123')
      
      // テスト募集データと応募データを作成
      cy.task('createTestPostWithApplications', { authorId: 'author-id' })
    })

    it('自分の募集への応募一覧を確認できる', () => {
      // 投稿管理ページに移動
      cy.visit('/profile/posts')
      
      // 募集を選択
      cy.get('[data-testid="post-item"]').first().click()
      
      // 応募管理タブをクリック
      cy.get('[data-testid="applications-tab"]').click()
      
      // 応募一覧が表示される
      cy.get('[data-testid="application-list"]').should('be.visible')
      cy.get('[data-testid="applicant-item"]').should('have.length.greaterThan', 0)
      
      // 応募者情報が表示される
      cy.get('[data-testid="applicant-item"]').first().within(() => {
        cy.get('[data-testid="applicant-name"]').should('be.visible')
        cy.get('[data-testid="application-message"]').should('be.visible')
        cy.get('[data-testid="application-date"]').should('be.visible')
      })
    })

    it('応募を承認できる', () => {
      cy.visit('/posts/my-post/applications')
      
      // 審査中の応募を選択
      cy.get('[data-testid="applicant-item"]')
        .contains('[data-testid="application-status"]', '審査中')
        .parent()
        .within(() => {
          cy.get('[data-testid="accept-button"]').click()
        })
      
      // 確認ダイアログが表示される
      cy.get('[data-testid="confirm-dialog"]')
        .should('be.visible')
        .and('contain', 'この応募を承認しますか？')
      
      // 承認を確認
      cy.get('[data-testid="confirm-button"]').click()
      
      // 成功メッセージが表示される
      cy.get('[data-testid="toast-success"]')
        .should('be.visible')
        .and('contain', '応募を承認しました')
      
      // ステータスが更新される
      cy.get('[data-testid="application-status"]')
        .should('contain', '承認済み')
    })

    it('応募を拒否できる', () => {
      cy.visit('/posts/my-post/applications')
      
      // 審査中の応募を選択
      cy.get('[data-testid="applicant-item"]')
        .contains('[data-testid="application-status"]', '審査中')
        .parent()
        .within(() => {
          cy.get('[data-testid="reject-button"]').click()
        })
      
      // 確認ダイアログが表示される
      cy.get('[data-testid="confirm-dialog"]')
        .should('be.visible')
        .and('contain', 'この応募を拒否しますか？')
      
      // 拒否を確認
      cy.get('[data-testid="confirm-button"]').click()
      
      // 成功メッセージが表示される
      cy.get('[data-testid="toast-success"]')
        .should('be.visible')
        .and('contain', '応募を拒否しました')
      
      // ステータスが更新される
      cy.get('[data-testid="application-status"]')
        .should('contain', '見送り')
    })
  })

  describe('通知機能', () => {
    it('新しい応募で通知を受信する', () => {
      // 募集投稿者としてログイン
      cy.login('author@example.com', 'password123')
      
      // 通知アイコンに未読バッジがある
      cy.get('[data-testid="notification-badge"]')
        .should('be.visible')
        .and('contain', '1')
      
      // 通知を開く
      cy.get('[data-testid="notification-button"]').click()
      
      // 通知リストが表示される
      cy.get('[data-testid="notification-list"]').should('be.visible')
      
      // 新着応募の通知が表示される
      cy.get('[data-testid="notification-item"]')
        .should('contain', '新しい応募が届きました')
        .click()
      
      // 応募管理ページに移動する
      cy.url().should('include', '/applications')
    })

    it('応募結果の通知を受信する', () => {
      // 応募者としてログイン
      cy.login('applicant@example.com', 'password123')
      
      // 通知を確認
      cy.get('[data-testid="notification-button"]').click()
      
      // 応募承認の通知が表示される
      cy.get('[data-testid="notification-item"]')
        .should('contain', '応募が承認されました')
        .click()
      
      // 応募履歴ページに移動する
      cy.url().should('include', '/profile/applications')
    })
  })

  describe('レスポンシブデザイン', () => {
    it('モバイル端末で応募フローが動作する', () => {
      // モバイル表示に切り替え
      cy.viewport('iphone-x')
      
      // 募集詳細ページを表示
      cy.visit('/posts/test-post-1')
      
      // 応募ボタンが表示される
      cy.get('[data-testid="apply-button"]').should('be.visible')
      
      // 応募モーダルを開く
      cy.get('[data-testid="apply-button"]').click()
      
      // モバイル向けモーダルが表示される
      cy.get('[data-testid="application-modal"]')
        .should('be.visible')
        .and('have.class', 'mobile-modal')
      
      // フォームが正しく表示される
      cy.get('[data-testid="application-message"]').should('be.visible')
      cy.get('[data-testid="submit-application"]').should('be.visible')
    })
  })

  describe('アクセシビリティ', () => {
    it('キーボードナビゲーションで応募できる', () => {
      cy.visit('/posts/test-post-1')
      
      // Tabキーで応募ボタンに移動
      cy.get('body').tab().tab().tab()
      cy.focused().should('have.attr', 'data-testid', 'apply-button')
      
      // Enterキーで応募モーダルを開く
      cy.focused().type('{enter}')
      cy.get('[data-testid="application-modal"]').should('be.visible')
      
      // フォームをキーボードで操作
      cy.get('[data-testid="application-message"]').focus().type('キーボードからの応募です')
      
      // Tabキーで送信ボタンに移動
      cy.get('[data-testid="application-message"]').tab()
      cy.focused().should('have.attr', 'data-testid', 'submit-application')
      
      // Enterキーで送信
      cy.focused().type('{enter}')
      
      // 応募完了を確認
      cy.get('[data-testid="application-success"]').should('be.visible')
    })

    it('スクリーンリーダー用のテキストが適切に設定されている', () => {
      cy.visit('/posts/test-post-1')
      
      // aria-label属性の確認
      cy.get('[data-testid="apply-button"]')
        .should('have.attr', 'aria-label')
        .and('include', '応募する')
      
      // 応募モーダルを開く
      cy.get('[data-testid="apply-button"]').click()
      
      // モーダルのaria属性確認
      cy.get('[data-testid="application-modal"]')
        .should('have.attr', 'role', 'dialog')
        .and('have.attr', 'aria-labelledby')
        .and('have.attr', 'aria-modal', 'true')
      
      // フォーム要素のラベル確認
      cy.get('[data-testid="application-message"]')
        .should('have.attr', 'aria-describedby')
    })
  })
})