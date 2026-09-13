export const accountDeletionContent = {
  title: "RE:CREATIONアカウントの削除",
  lead: "Microsoft 365の学校アカウントで本人確認後、RE:CREATIONアカウントの削除を受け付けます。",
  scopeNotice:
    "削除されるのはRE:CREATIONのアカウントと関連データです。Microsoft 365アカウントは削除されません。",
  targets: [
    "プロフィール・表示情報",
    "Microsoft連携情報・ロール・所属情報",
    "参加履歴・通知設定などのRE:CREATION内データ",
    "ログインセッション・通知用の端末情報",
  ],
  nonTargets: [
    "Microsoft 365アカウント、パスワード、メール、ファイル",
    "学校・教育機関が管理する公式記録",
    "他の利用者のアカウントやデータ",
  ],
  retention: {
    heading: "削除処理と保持情報",
    items: [
      "関連データは削除または匿名化します。",
      "削除記録などは、法令・障害対応に必要な期間保持する場合があります。",
      "Microsoft 365や学校側の情報は、それぞれの方針に従います。",
    ],
  },
  contact: {
    heading: "お問い合わせ",
    items: [
      "レ・クリエイション実行委員会　アプリ開発班",
      "利用できない場合や不明点は、担当教官または学校指定窓口へご連絡ください。",
    ],
  },
} as const;
