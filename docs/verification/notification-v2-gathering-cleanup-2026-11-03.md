# Gathering自動通知の実API確認（2026-11-03）

関連: #343 / PR #423。Backend #449の実装がPR #564 / #567で統合された後の確認。

## 対象と境界

- recwatch: #423へdevelop `91fc7e8`を統合した作業ツリー。
- Backend develop: `defbe87fb653ecf0b479db151baad36d4bc7e8fa`。
- 最新コードを別directoryへ展開し、Wrangler localの専用D1 / KV / R2 / Queueを用意。プロジェクトと同じcompatibility date `2024-09-23`を使用。
- 既存migrationを適用し、合成staff / user、Event 3件、Gathering Spot 1件だけを準備。実環境のBinding・Firebase資格情報・実ユーザーは使用していない。
- `PUT /api/v1/events/{eventId}/gatherings`でGatheringを作成し、実Generatorがautomatic Notification / Scheduleを作ることを確認した。
- sending / completedと5種のDeliveryはローカルDBで準備した状態fixture。実Workerのclaim・完了・送信を確認したという意味ではない。
- Gathering削除自体は同じ本番PUT Routeへ`rounds: []`を送信した。通知SQLを手動で削除・停止して成功扱いにはしていない。

## 確認結果

| 条件               | 実操作・結果                                                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| automatic生成      | Event #900001〜#900003のGathering保存→Notification #1〜#3 / Schedule #1〜#3を生成。creation.methodはautomatic、source.labelは集合場所名 |
| 未開始の削除       | Event #900001のGathering削除後、Notification #1とSchedule #1のGETが404                                                                  |
| 配信中の削除       | Event #900002のGathering削除後、Schedule #2がstopped、reason=source_deleted、stoppedBy=null                                             |
| Deliveryの停止範囲 | pending / retry_waitの2件だけstopped。sending / sent / failed各1件を保持。ResultsのID別状態も一致                                       |
| 完了履歴の保持     | Event #900003のGathering削除後もSchedule #3はcompleted、Stop監査を追加しない                                                            |
| 参照元削除         | 残るautomaticのsource.labelはnull。Notification / Schedule / Resultsを引き続き取得可能                                                  |
| 再送拒否           | source削除済みのSchedule #2 / #3へPOST resend→実API409                                                                                  |
| フロント境界       | 本番HTTP adapter・共通apiClient・parserで同じGETを確認。削除404、一覧からの消失、stopped集計、completed履歴、Resultsを確認              |
| 操作可否           | canRunMonitorActionで削除済みsourceの再送を禁止し、stoppedにcancel / stopを許可しない                                                   |

[証跡JSON](notification-v2-gathering-cleanup-2026-11-03.json)には実APIのmethod / path / statusと合成データの前後値を保存した。認証Header・Token・実環境設定値は含めていない。

一覧は画面と同じ`page=1&limit=50`で確認した。Backendのページ未指定互換Responseを、ページ指定時の契約と混同しない。

## 自動回帰

Backendの既存5ファイル / 46 tests成功。

- GatheringNotificationCleanupService / Policy / Repository
- EventGatheringSettingsService
- admin-notification-schedule-action-api

未開始削除、source_deleted停止、履歴保持、原子性、不正policy拒否、cleanup後のResolver / Delivery / Retry取得対象除外、削除後Generator再実行を含む。これはWrangler HTTP確認とは別の自動テスト結果。

FrontendのRoute統合7件は、最新developのMarkdownエディター遅延読み込み、現在のラベル・button名・Calendar導線と、一覧のpagination Responseへ追従した。HTTP adapter / validatorを緩和せず、既存の成功・400・409・5xx・通信失敗・404検証を維持する。

## Frontend最終確認

- 全160 files / 896 tests成功（Route統合7件を含む）。
- format / lint / typecheck / production build成功。法務ページのbuild成果物検証も成功。
- 作成・保存後はプレビューの見出しだけで遷移完了と判定せず、遷移先の一覧link・削除buttonの出現を待つ。

## 再確認手順

1. 上記Backend SHAと既存migrationを隔離Wrangler localへ準備し、合成staff JWTとEvent / Gathering Spotを作る。
2. Gathering設定PUTで3件を作成し、automatic通知の生成とsource.labelをGETで確認する。
3. 専用DBだけで、1件をsendingとpending / retry_wait / sending / sent / failedへ、1件をcompletedへ準備する。
4. 各EventのGathering設定PUTへ`rounds: []`を送り、404・stopped監査・配送状態・完了履歴・source.label=nullをGETで確認する。
5. source削除済みScheduleの再送409を確認する。
6. 本番HTTP adapterとページ指定一覧・詳細・Resultsを照合し、表示用の操作可否も確認する。

## 未確認

- Work設定でローカルブラウザー使用が無効のため、今回の実画面操作・新規スクリーンショットは未実施。HTTP成功を画面確認済みとは記録しない。
- FCM認証・Queue Consumer・実Retry・Workerの実claim / 完了競合・端末配信。
- 通常App shellを含むMicrosoft実ログイン、Calendarの遅延GETとStop POST409の画面操作。
- PRレビューと最終完了判断。

Backend #449のmerge待ちは解消したが、上記未確認があるため#343はOpen、#423はDraftを維持する。
