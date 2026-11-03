# 通知競合のHTTP境界とCI時刻確認（2026-11-03）

関連: #343 / PR #423。実画面・実FCMの完了記録とは区別する。

## CIの予約入力修正

前head `a4ce32f`のCIでは予約作成1件だけが失敗した。テストが予約入力を実行ホストのローカル時刻で組み立てていたが、最新フォームは常にJSTとして解釈するため、UTCのCIでは9時間前の入力となり保存buttonが無効になっていた。

入力をJSTの年月日時分で作り、POSTのsendAtに`+09:00`が付くことも確認する。productionの日時検証を緩和せず、テストを現行契約へ合わせた。

- `TZ=UTC NODE_OPTIONS=--no-experimental-webstorage npm test` → 160 files / 898 tests成功。
- `TZ=Asia/Tokyo NODE_OPTIONS=--no-experimental-webstorage npm test -- app/routes/notification-integration.test.tsx` → 8 tests成功。

## 追加したFrontend統合確認

| 対象                    | 境界                                                                          | 確認内容                                                                                                                                         |
| ----------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Calendarの遅延GETと削除 | 本番Route / HTTP adapter / apiClient / Page、HTTP応答のみMock                 | Calendar GETの古い応答を保持→一覧へ移動→DELETE204。古いGETを解放する前に新GETを始めず、解放後に再GET。Calendarへ戻っても削除済み予定は復活しない |
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

#343はOpen、#423はDraftを維持する。
