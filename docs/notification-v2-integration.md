# Notification v2 統合確認（#343）

## 実施状況と開始条件

この文書は通知管理のシナリオ・検証手順・未実施項目をまとめる。現段階はBackend Cutover前の先行準備であり、#343の完了報告ではない。

- recwatch #335 / #336 / #337 / #338 / #340 / #341 / #342 / #344はdevelopへ統合済み。
- Backend #451（PR #474）は準備時点（2026-10-20）で未merge。実施時に最新状態を確認する。
- 最終実API検証はBackend Cutover後のdevelopを使用する。Backendの作業ブランチをrecwatchへ取り込まない。
- 本番RouteのHTTP adapter・共通apiClientは変更しない。Mockへの切り替えはテスト内だけで行う。

## 自動テストの境界

`app/routes/notification-integration.test.tsx`は、本番の作成・一覧・詳細・編集Route moduleをMemoryRouterへ接続し、HTTP応答だけをMockに置き換える。HTTP adapter、Request / Response Mapper、apiClient、FeedbackProvider、Toast、AppNotificationCenterは実装をそのまま使用する。

- 即時・予約作成 → 詳細 → 一覧 → 編集 → 詳細 → 削除 → 一覧の遷移を確認する。
- 予約作成ではCalendarへの反映とCalendarから詳細への遷移も確認する。
- 成功はToastに表示し、操作通知履歴に保存しない。
- 400はフォーム内に表示し、Toast・操作通知履歴に保存しない。
- 409 / 500 / 通信失敗では入力を保持し、既存Toastと操作通知履歴へ表示する。
- 詳細404は画面内で表示し、一覧へ勝手に遷移しない。

このテストは認証・実DB・Cron・Queue・FCM・実ブラウザーを動かさない。Mock応答での成功を実API確認済みと記録しない。

```bash
VITE_BACKEND_BASE_URL=http://localhost:8787 npm run test -- app/routes/notification-integration.test.tsx
```

Node.js 25でjsdomのlocalStorageが利用できない場合は、上記コマンドに`NODE_OPTIONS=--no-experimental-webstorage`を付ける。

## シナリオと証跡

「実API」はすべて未実施。既存Issueでの個別API確認もCutover後にこの表に従って再実施する。

| ID  | 操作・事前条件                       | 確認する結果                                                | 現在の自動確認                           | 実API  |
| --- | ------------------------------------ | ----------------------------------------------------------- | ---------------------------------------- | ------ |
| N01 | manual即時作成 → 一覧 → 詳細         | POSTのIDで遷移し、GETの内容を表示                           | 今回のRoute統合                          | 未実施 |
| N02 | manual予約作成 → Calendar → 詳細     | 指定日時と対象Scheduleが一致、Calendarに表示                | 今回のRoute統合                          | 未実施 |
| N03 | 全Schedule未開始で編集               | push / detail / importance / audience / deliveryを保存      | 今回のRoute統合、既存Hook                | 未実施 |
| N04 | 編集画面を開いた後にWorker開始       | PATCH409 → GET → detail入力だけ保持し、最新の編集範囲へ切替 | 既存useNotificationEdit                  | 未実施 |
| N05 | manual未開始Notificationを削除       | 対象確認後DELETE、一覧とCalendarを再取得                    | 今回のRoute統合、既存useNotificationList | 未実施 |
| N06 | 一覧・Calendarの遅延GET中に削除      | 古いGET完了後に新しいGET、削除済み行が残らない              | 既存useNotificationList                  | 未実施 |
| N07 | 未開始Scheduleを予約取消             | 204後にGET、Notificationは残りScheduleだけ消える            | 既存useNotificationRemoval               | 未実施 |
| N08 | 取消直前にWorkerがclaim              | 409を成功扱いせずGET、開始済みへ更新                        | 既存useNotificationRemoval               | 未実施 |
| N09 | Monitorでsendingを表示               | Schedule状態・Recipient数・Delivery数をAPI値のまま表示      | 既存Monitor Hook / Page                  | 未実施 |
| N10 | sendingを緊急Stop                    | bodyなしPOST、応答はIDとstoppedのみ、GETで監査・集計を取得  | 既存HTTP adapter / Monitor操作           | 未実施 |
| N11 | Stop直前にcompleted、または重複Stop  | 409後にGET、Nodeとdialogを保持                              | 既存Monitor操作                          | 未実施 |
| N12 | immediate / scheduledで再送          | 元Scheduleは保持し、新ScheduleがGET一覧へ現れる             | 既存HTTP adapter / Monitor操作           | 未実施 |
| N13 | source削除済みautomaticから再送      | 操作非表示・最終判断はBackend409、履歴を破壊しない          | 既存Monitor操作                          | 未実施 |
| N14 | Tokenが0件のRecipient                | User数とToken数を混同せず、詳細・Resultsで確認可能          | 既存詳細Page / DTO                       | 未実施 |
| N15 | retry_waitがある配信                 | Retryを成功扱いせず、数値はBackend値と一致                  | 既存Monitor Page                         | 未実施 |
| N16 | automaticのsource.labelがnull        | 表示が壊れず、再送を許可しない                              | 既存Monitor操作・表示                    | 未実施 |
| N17 | 400のcontent / schedule / importance | 項目またはフォーム内へ表示、Toast / Centerへ保存しない      | 今回のRoute統合、既存Form / Mapper       | 未実施 |
| N18 | 404 / 409 / 5xx / 通信失敗           | 入力・選択を保持し、操作エラーは既存Feedbackへ              | 今回のRoute統合、既存Hook                | 未実施 |
| N19 | Monitorの自動更新失敗 → 回復         | 前回表示を保持、background-errorを重複保存しない            | 既存useNotificationMonitor               | 未実施 |

対応する既存テストは`app/features/notifications/test/`配下にある。表の「既存」は個別境界での確認を示し、画面間・実runtime全体の成功を意味しない。

## Cutover後の実施手順

1. recwatch / rectime-apiそれぞれのdevelopのSHAと実施日時を記録し、API #451のmergeを確認する。
2. 各RepositoryのREADMEに従ってローカル環境を準備する。認証・R2・Firebaseの設定値は既存のローカル設定で管理し、文書・コマンド出力・PRへ貼り付けない。
3. HTTPの確認用にテスト専用manual通知を作る。Worker / Retry / Stopの確認には隔離されたテストDBとテスト端末を使い、実利用者へ送らない。
4. N01〜N19を実施し、各行に成功・失敗・ブロック、Requestのmethod / path / status、対象ID、実際に見えた結果を記録する。
5. Stop・取消・編集の競合は、単なる固定レスポンスではなくWorkerの開始・完了との競合でも確認する。公開APIで作れない状態の準備方法はBackend担当と合わせる。
6. 失敗は再現手順と実際のResponse形状を残す。ステータス・人数・監査情報をFrontendで補完して通過扱いにしない。
7. 必要な画面証跡は、バージョン・対象IDが分かる状態で撮影する。スクリーンショットは`~/Desktop/recwatch-evidence/issue-343/`へ保存し、資格情報・個人情報が写っていないことを確認してPR本文へ添付する。

## 記録テンプレート

```text
シナリオID:
実施日時:
recwatch SHA / Backend SHA:
環境（Mock / 隔離実API / テスト端末）:
対象Notification ID / Schedule ID:
事前条件・操作:
HTTP method / path / status（認証ヘッダー・Tokenは記録しない）:
期待結果 / 実際の結果:
判定（成功 / 失敗 / ブロック）:
証跡ファイル:
残課題 / 関連Issue:
```

## 完了判定

- [ ] API #451 merge後のdevelopでN01〜N19を確認した。
- [ ] Monitor・Results・Delivery detailの数値が実APIと一致する。
- [ ] production RouteはHTTP adapterと既存apiClientを使用している。
- [ ] Mock / HTTPに別DTOや別statusを作っていない。
- [ ] 400 inline、成功Toast、操作失敗Toast + Center、自動更新失敗background-errorを確認した。
- [ ] Backendのユーザー向け通知履歴を操作用Centerへ複製していない。
- [ ] format / lint / typecheck / build / 関連testが通過した。
- [ ] 実APIの証跡をPRへ添付し、レビューが完了した。

先行準備のPRをmergeしても、上の未実施項目が残る間は#343を完了にしない。
