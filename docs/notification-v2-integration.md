# Notification v2 統合確認（#343）

## 実施状況と開始条件

この文書は通知管理のシナリオ・検証手順・未実施項目をまとめる。Route統合テストに加え、2026-10-24に最新Backendの隔離HTTP境界を一部確認した。画面・runtime全体の検証は残っており、#343の完了報告ではない。

- recwatch #335 / #336 / #337 / #338 / #340 / #341 / #342 / #344はdevelopへ統合済み。
- Backendの旧PR #474はCloseされ、代替のPR #562がdevelopへmerge済み。#451は管理上Openであり、Gathering削除hookの#449もOpen。#474のmergeを開始条件にはしない。
- 実API検証にはv2 Routeが接続された最新developを使用する。Backendの作業ブランチをrecwatchへ取り込まない。
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

下表の「実API」は隔離されたローカルHTTP境界の確認状況。画面E2Eや実FCM送信の完了を示さない。[実施記録](verification/notification-v2-local-api-2026-10-24.md)と[HTTP証跡](verification/notification-v2-local-api-2026-10-24.json)を参照する。

| ID  | 操作・事前条件                       | 確認する結果                                                | 現在の自動確認                           | 実API                                            |
| --- | ------------------------------------ | ----------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------ |
| N01 | manual即時作成 → 一覧 → 詳細         | POSTのIDで遷移し、GETの内容を表示                           | 今回のRoute統合                          | 即時作成・一覧・詳細を画面確認                   |
| N02 | manual予約作成 → Calendar → 詳細     | 指定日時と対象Scheduleが一致、Calendarに表示                | 今回のRoute統合                          | 予約作成・Calendar・詳細を画面確認               |
| N03 | 全Schedule未開始で編集               | push / detail / importance / audience / deliveryを保存      | 今回のRoute統合、既存Hook                | APIと編集保存の画面確認                          |
| N04 | 編集画面を開いた後にWorker開始       | PATCH409 → GET → detail入力だけ保持し、最新の編集範囲へ切替 | 既存useNotificationEdit                  | 開始済みfixtureで409・実競合未                   |
| N05 | manual未開始Notificationを削除       | 対象確認後DELETE、一覧とCalendarを再取得                    | 今回のRoute統合、既存useNotificationList | 詳細からの削除・一覧復帰を画面確認               |
| N06 | 一覧・Calendarの遅延GET中に削除      | 古いGET完了後に新しいGET、削除済み行が残らない              | 既存useNotificationList                  | 一覧GETを20秒遅延し削除、完了後の再GETを確認     |
| N07 | 未開始Scheduleを予約取消             | 204後にGET、Notificationは残りScheduleだけ消える            | 既存useNotificationRemoval               | 取消後にScheduleだけ消え本体維持を画面確認       |
| N08 | 取消直前にWorkerがclaim              | 409を成功扱いせずGET、開始済みへ更新                        | 既存useNotificationRemoval               | dialog中にDB状態変更→409→GETを画面確認・Worker未 |
| N09 | Monitorでsendingを表示               | Schedule状態・Recipient数・Delivery数をAPI値のまま表示      | 既存Monitor Hook / Page                  | 状態fixtureのMonitor集計も画面確認               |
| N10 | sendingを緊急Stop                    | bodyなしPOST、応答はIDとstoppedのみ、GETで監査・集計を取得  | 既存HTTP adapter / Monitor操作           | 画面操作→stopped・配送停止数をGETで確認          |
| N11 | Stop直前にcompleted、または重複Stop  | 409後にGET、Nodeとdialogを保持                              | 既存Monitor操作                          | 完了状態への自動更新でdialogの実行不可を確認     |
| N12 | immediate / scheduledで再送          | 元Scheduleは保持し、新ScheduleがGET一覧へ現れる             | 既存HTTP adapter / Monitor操作           | 即時/日時指定再送を画面確認・非表示条件を修正    |
| N13 | source削除済みautomaticから再送      | 操作非表示・最終判断はBackend409、履歴を破壊しない          | 既存Monitor操作                          | source不在fixtureで409・削除hook未               |
| N14 | Tokenが0件のRecipient                | User数とToken数を混同せず、詳細・Resultsで確認可能          | 既存詳細Page / DTO                       | CronのRecipient確定・Results画面確認、配信完了未 |
| N15 | retry_waitがある配信                 | Retryを成功扱いせず、数値はBackend値と一致                  | 既存Monitor Page                         | retry_wait fixtureのAPI確認・実Retry未           |
| N16 | automaticのsource.labelがnull        | 表示が壊れず、再送を許可しない                              | 既存Monitor操作・表示                    | API確認・画面未                                  |
| N17 | 400のcontent / schedule / importance | 項目またはフォーム内へ表示、Toast / Centerへ保存しない      | 今回のRoute統合、既存Form / Mapper       | importance 400のみ確認・画面未                   |
| N18 | 404 / 409 / 5xx / 通信失敗           | 入力・選択を保持し、操作エラーは既存Feedbackへ              | 今回のRoute統合、既存Hook                | 403/404/409 API確認・5xx/通信失敗はMockのみ      |
| N19 | Monitorの自動更新失敗 → 回復         | 前回表示を保持、background-errorを重複保存しない            | 既存useNotificationMonitor               | 自動GETへ500を注入し表示保持・重複抑止・回復確認 |

対応する既存テストは`app/features/notifications/test/`配下にある。表の「既存」は個別境界での確認を示し、画面間・実runtime全体の成功を意味しない。

## Cutover後の実施手順

1. recwatch / rectime-apiそれぞれのdevelopのSHAと実施日時を記録し、v2 Routeと残る#449等の実装状況を確認する。
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

- [ ] 最新developでN01〜N19の実API・画面・runtimeを確認した。
- [ ] Monitor・Results・Delivery detailの数値が実APIと一致する。
- [x] production RouteはHTTP adapterと既存apiClientを使用している。
- [x] Mock / HTTPに別DTOや別statusを作っていない。
- [ ] 400 inline、成功Toast、操作失敗Toast + Center、自動更新失敗background-errorを確認した。
- [ ] Backendのユーザー向け通知履歴を操作用Centerへ複製していない。
- [x] format / lint / typecheck / build / 関連testが通過した。
- [ ] 実APIの証跡をPRへ添付し、レビューが完了した。

先行準備のPRをmergeしても、上の未実施項目が残る間は#343を完了にしない。
