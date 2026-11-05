# 通知競合のHTTP境界とCI時刻確認（2026-11-03）

関連: #343 / PR #423。実画面・実FCMの完了記録とは区別する。

## CIの予約入力修正

前head `a4ce32f`のCIでは予約作成1件だけが失敗した。テストが予約入力を実行ホストのローカル時刻で組み立てていたが、最新フォームは常にJSTとして解釈するため、UTCのCIでは9時間前の入力となり保存buttonが無効になっていた。

入力をJSTの年月日時分で作り、POSTのsendAtに`+09:00`が付くことも確認する。productionの日時検証を緩和せず、テストを現行契約へ合わせた。

次のCIではUTC予約入力の失敗が解消し、898件中897件が成功した。残る1件は初回Markdownエディターのmodule読み込みが既定の1秒を超えたためで、`findByLabelText`が実際のエディター出現を最大10秒待つよう変更した。該当する作成・編集・削除フローだけテスト期限を15秒とし、固定sleepやretry、assertionの削除は行わない。

- `TZ=UTC NODE_OPTIONS=--no-experimental-webstorage npm test` → 160 files / 898 tests成功。
- `TZ=Asia/Tokyo NODE_OPTIONS=--no-experimental-webstorage npm test -- app/routes/notification-integration.test.tsx` → 8 tests成功。

## 追加したFrontend統合確認

| 対象                    | 境界                                                                          | 確認内容                                                                                                                                         |
| ----------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Calendarの遅延GETと削除 | 本番Route / HTTP adapter / apiClient / Page、HTTP応答のみMock                 | Calendar GETの古い応答を保持→別Routeの一覧へ移動→DELETE204→一覧を再取得。旧Calendar GET完了後にCalendarへ戻り、新GETと削除済み予定の非表示を確認 |
| StopのHTTP409           | Monitor Page / 本番HTTP adapter / apiClient、HTTP応答とReact Flow描画のみMock | bodyなしPOST stop→409→GETでcompletedへ更新。Nodeとdialogを維持し実行buttonを無効化。action-errorを報告し、action-successにしない                 |

テストは`app/routes/notification-integration.test.tsx`と`app/features/notifications/test/NotificationMonitorPage.test.tsx`へ追加した。2 files / 29 tests成功。

これらはjsdomでの描画・HTTP境界統合。ローカルブラウザーを操作した記録ではなく、実Workerが返した409でもない。従来のHTTP境界・Hook単体確認より広い経路を自動化する。

## Backendの既存境界確認

最新Backend `defbe87fb653ecf0b479db151baad36d4bc7e8fa`で以下5 files / 68 tests成功。

- NotificationStopRepository: StopとRetry、timeout回収、429再試行の競合、配送履歴保持、条件付きStop。
- NotificationAudienceResolverRepository: due Scheduleの一度だけのclaim、再開・同時再実行、source / Audience対象消失。
- NotificationRetryPolicy: 設定に沿う再試行期限と終端。
- NotificationDeliveryEligibility: 匿名化・無効化・削除中・Token所有者変更後の配送除外。
- NotificationDeliveryQueueConsumer: 完了時ack、失敗時retry、不正messageの扱い。

Repository系はローカルD1を使うがFCMはテスト代役、Queue ConsumerはMessageBatch・DeliveryServiceのStubを使う。実Queueの配送、実FCM認証、実端末受信の証拠にはしない。

## 残条件

- ローカルブラウザーを有効にしてCalendar競合・Stop409・Gathering削除後の画面を確認する。
- 実WorkerとAPIのclaim / 完了競合、Queue Consumer、実Retry、FCM認証・送信・端末受信。
- Microsoft実ログインと通常App shellを含むE2E。
- PRレビュー・最終判断。

#343はOpenを維持する。#423は11/03にレビュー可能な状態へ変更済み。

## Calendar分離後のレビュー対応（2026-11-05）

最新develop `9e1c98a`を統合し、テストRouterへ本番の`NotificationsCalendarRoute`を登録した。`calendar`を通知IDとして扱うGETが出ないことも確認する。

- 旧query切り替えを前提とした待機順序を廃止し、Calendarと一覧を別Routeとして検証する。
- Calendar再読み込みを保留→一覧へ移動→DELETE204→一覧GETで空表示→旧Calendar GETを解放→Calendarへ戻って新GET・空表示を確認する。
- 現行の「カレンダーを再読み込み」「この期間に表示する通知はありません」と、本日の配信一覧の詳細リンクを使う。FullCalendar本体はMockに置換しない。
- 日付だけを合成日時へ固定し、UTC / JSTと深夜の実行でも当日の予定リンクを同じ条件で確認する。非同期timerは実時間のまま使う。

HTTP応答はMockであり、実ブラウザー操作・実Backendでの競合完了とは扱わない。

検証結果: UTC全162 files / 947 tests、JSTのRoute / Calendar 2 files / 11 tests、format:check / lint / typecheck / buildが成功した。
