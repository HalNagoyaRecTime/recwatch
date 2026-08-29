// recwatch#224の表示文言。
// rectime-api#263/rectime-2026-docs#207待ちの仮テキスト
// 確定後は、このファイルの値だけを差し替え
export const accountDeletionContent = {
  title: "RecTimeアカウントの削除",
  lead: "Microsoft 365の職場アカウントで本人確認のうえ、RecTimeアカウントの削除を行います。Microsoft 365アカウント自体は削除されません。",
  targets: [
    "（仮）RecTime上のプロフィール情報",
    "（仮）参加履歴・通知設定などRecTime内のデータ",
  ],
  nonTargets: [
    "（仮）Microsoft 365アカウント本体",
    "（仮）法令等により保持が必要なデータ（保持期間経過後に削除）",
  ],
  retention: {
    heading: "データの保持について",
    body: "（仮）一部のデータは法令・運用上の理由により一定期間保持された後、削除されます。詳細は確定次第この画面に反映します。",
  },
  contact: [
    "レ・クリエイション実行委員会　アプリ開発班",
    "担当教官：高橋真広先生",
  ],
} as const;
