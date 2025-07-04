import type { Post } from '@/types/post'

export const mockPosts: Post[] = [
  {
    id: '1',
    title: 'VRChatアバター撮影モデル募集',
    description: 'VRChatアバターの宣伝用写真撮影にご協力いただけるモデルさんを募集しています。美しいワールドでの撮影となります。',
    category: 'photo',
    type: 'paid',
    requirements: [
      'VRChatアカウント必須',
      '18歳以上',
      '日本語でのコミュニケーション可能',
      '撮影時間：約2時間'
    ],
    compensation: '5,000円',
    deadline: '2024-02-15',
    worldName: 'Aurora Studio',
    contactMethod: 'discord',
    contactValue: 'photographer#1234',
    authorId: 'user1',
    authorName: 'フォトスタジオAura',
    authorAvatar: 'https://via.placeholder.com/40',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    applicationsCount: 3,
    viewsCount: 127,
    tags: ['撮影', 'モデル', 'アバター', 'スタジオ']
  },
  {
    id: '2',
    title: 'VTuber配信コラボメンバー募集',
    description: 'VRChatでの配信企画にて、一緒に楽しく配信してくださる方を募集しています。ゲーム実況やワールド巡りなど。',
    category: 'streaming',
    type: 'collaboration',
    requirements: [
      'VRChatでの配信経験',
      'Discord通話可能',
      '定期的な活動が可能',
      '明るく楽しい性格'
    ],
    deadline: '2024-02-20',
    contactMethod: 'twitter',
    contactValue: '@vtuber_collab',
    authorId: 'user2',
    authorName: 'VTuberさくら',
    authorAvatar: 'https://via.placeholder.com/40',
    status: 'active',
    createdAt: '2024-01-14T15:30:00Z',
    updatedAt: '2024-01-14T15:30:00Z',
    applicationsCount: 8,
    viewsCount: 284,
    tags: ['配信', 'コラボ', 'VTuber', 'ゲーム']
  },
  {
    id: '3',
    title: 'VRChat動画制作 - ダンス動画出演者募集',
    description: 'VRChatでのダンス動画制作企画です。楽しいダンス動画を一緒に作りませんか？初心者の方も大歓迎！',
    category: 'video',
    type: 'volunteer',
    requirements: [
      'VRChatでダンス可能',
      '練習時間を確保できる方',
      '協調性のある方',
      '撮影日程に参加可能'
    ],
    deadline: '2024-02-10',
    worldName: 'Dance Studio VR',
    contactMethod: 'discord',
    contactValue: 'dancecrew#5678',
    authorId: 'user3',
    authorName: 'ダンスクルーVR',
    authorAvatar: 'https://via.placeholder.com/40',
    status: 'active',
    createdAt: '2024-01-13T20:15:00Z',
    updatedAt: '2024-01-13T20:15:00Z',
    applicationsCount: 12,
    viewsCount: 356,
    tags: ['動画', 'ダンス', '初心者歓迎', 'グループ']
  },
  {
    id: '4',
    title: 'VRイベント司会者募集',
    description: 'VRChatで開催される大型イベントの司会を担当していただける方を募集しています。',
    category: 'event',
    type: 'paid',
    requirements: [
      '司会経験必須',
      '大勢の前でも緊張しない方',
      'イベント当日参加必須',
      '事前打ち合わせ参加可能'
    ],
    compensation: '15,000円',
    deadline: '2024-02-05',
    contactMethod: 'email',
    contactValue: 'event@vrchat-events.com',
    authorId: 'user4',
    authorName: 'VRイベント企画',
    authorAvatar: 'https://via.placeholder.com/40',
    status: 'active',
    createdAt: '2024-01-12T14:45:00Z',
    updatedAt: '2024-01-12T14:45:00Z',
    applicationsCount: 5,
    viewsCount: 198,
    tags: ['イベント', '司会', '大型イベント', '経験者優遇']
  },
  {
    id: '5',
    title: 'ボイスアクター募集 - VRアニメ制作',
    description: 'VRChat内で制作するアニメ作品のボイスアクターを募集しています。様々な役柄があります。',
    category: 'voice',
    type: 'paid',
    requirements: [
      'ボイスアクティング経験',
      '録音環境を持っている',
      '台本読み合わせ参加可能',
      '長期間のコミット可能'
    ],
    compensation: '役によって変動（5,000円〜20,000円）',
    deadline: '2024-02-25',
    contactMethod: 'discord',
    contactValue: 'vranim_studio#9999',
    authorId: 'user5',
    authorName: 'VRアニメスタジオ',
    authorAvatar: 'https://via.placeholder.com/40',
    status: 'active',
    createdAt: '2024-01-11T11:20:00Z',
    updatedAt: '2024-01-11T11:20:00Z',
    applicationsCount: 15,
    viewsCount: 445,
    tags: ['ボイス', 'アニメ', '長期', '複数役']
  },
  {
    id: '6',
    title: '3Dモデリング依頼',
    description: '募集終了しました。たくさんのご応募ありがとうございました。',
    category: 'modeling',
    type: 'paid',
    requirements: [
      'Blender使用経験',
      '3Dモデリング実績',
      'VRChat向けモデル制作経験'
    ],
    compensation: '50,000円',
    contactMethod: 'twitter',
    contactValue: '@model_client',
    authorId: 'user6',
    authorName: 'モデル依頼者',
    authorAvatar: 'https://via.placeholder.com/40',
    status: 'closed',
    createdAt: '2024-01-10T09:30:00Z',
    updatedAt: '2024-01-15T16:00:00Z',
    applicationsCount: 23,
    viewsCount: 567,
    tags: ['モデリング', 'Blender', '高報酬', '募集終了']
  }
]

export const categoryLabels = {
  'customer-service': '接客',
  'meetings': '集会',
  'music-dance': '音楽・ダンス',
  'social': '出会い',
  'beginners': '初心者',
  'roleplay': 'ロールプレイ',
  'games': 'ゲーム',
  'other': 'その他'
}

export const eventFrequencyLabels = {
  'once': '単発',
  'weekly': '週1',
  'biweekly': '隔週',
  'monthly': '月1'
}

export const weekdayLabels = {
  0: '日曜日',
  1: '月曜日',
  2: '火曜日',
  3: '水曜日',
  4: '木曜日',
  5: '金曜日',
  6: '土曜日'
}

export const weekOfMonthLabels = {
  1: '第1週',
  2: '第2週',
  3: '第3週',
  4: '第4週'
}

export const contactMethodLabels = {
  discord: 'Discord',
  twitter: 'Twitter/X',
  email: 'メール',
  vrchat: 'VRChat'
}

export const statusLabels = {
  active: '募集中',
  closed: '募集終了',
  draft: '下書き'
}