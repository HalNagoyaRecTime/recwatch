# Notification v2 画面mutation・障害復旧確認（2026-10-24）

関連: #343 / PR #423。[初回の隔離API記録](notification-v2-local-api-2026-10-24.md)に追加する。

## 環境と限界

- recwatch: PR #423の`9d66456f790a1cb1d2b8653d8356632373d82b95`と本PRの追加差分。
- Backend: `d7b9fe1d3a80a3a76c8720e2ae4ae90aae783172`。本番Route・HTTP adapter・共通apiClient・認証Middleware・D1を使用。
- 別checkoutのWrangler local、合成staff / Recipientのみ。通常のMicrosoft認証・App shellは含まない。
- 削除・取消・Stop・即時/日時指定再送をブラウザーから操作した。実APIのResponseを固定Mockへ置き換えていない。
- 障害・遅延の確認だけ、ローカルHTTPプロキシを介した。指定GETの500は合成エラー、20秒の遅延は実APIが返した応答を一時保持したもの。実環境障害を観測したという意味ではない。
- Workerは稼働させず、sending / completedへの変更をローカルD1で準備した。実Workerのclaim・完了との競合、Queue、FCM、端末受信は未確認。
- 機密情報、認証Header、Token、Response本文をHTTP証跡へ保存していない。

## 確認結果

| 操作                | 対象                                         | 結果                                                                                                                                  |
| ------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 詳細から削除        | Notification #14 / Schedule #18              | 確認dialog→削除→一覧へ戻る。成功Toast、Centerへ成功履歴なし。API再確認404                                                             |
| 予約取消            | Notification #15 / Schedule #19              | Scheduleだけ消え、通知本文を保持。「Scheduleはまだありません」と成功Toastを表示                                                       |
| 即時再送            | Notification #16 / Schedule #20→#22、#22→#23 | 元Scheduleを保持、新Schedule生成。初回に表示漏れを発見し、修正後はGET一覧へ新Scheduleが現れる                                         |
| Stop                | Notification #17 / Schedule #21              | sendingのdialogから実行→stopped。GETでRecipient 1 / Delivery 1 / stopped 1、停止操作を非表示へ更新                                    |
| 自動更新失敗→復旧   | Monitor                                      | 30秒の自動GETへ500を注入。前回表示と選択を保持。再失敗でもCenterのbackground-errorは1件。障害解除後の再読み込みで復旧                 |
| 取消の409           | Notification #19 / Schedule #25              | dialog表示後にDBをsendingへ変更。DELETE409→GET。dialogに最新sendingとエラー、実行button無効。成功扱いにせずCenterへaction-errorを保存 |
| Stopの事前状態更新  | Notification #20 / Schedule #26              | dialog中にDBをcompletedへ変更。自動更新でdialogの最新状態がcompletedとなり、実行不可。POST409確認とは区別する                         |
| 一覧遅延GET中の削除 | Notification #18 / Schedule #24              | 実GETの応答を20秒保持した間にDELETE204。古いGET完了後に新しいGET200を実行し、削除済み行が復活しない                                   |

削除・取消・再送・Stopの最終API状態、および遅延GET→DELETE204→古いGET完了→新GET200の順序を再確認した。
[HTTP証跡](notification-v2-ui-mutations-2026-10-24.json)はプロキシ導入後のmethod / path / status / 時刻のみを含む。
最初の4操作は導入前の直接API接続で行ったため、そのHTTPイベント自体は追加JSONに含まない。

日時指定再送もSchedule #23から実行し、Schedule #27を作成。指定した2026-10-25 12:30 JSTを画面とGETで確認した。

## 修正した問題

即時再送の`sendAt`は作成時刻となるため、次のGET時点では過去になる。
従来のモニターはscheduledを「現在以降」に限定し、新ScheduleとWorker開始待ちを一覧から除外していた。
scheduledの表示を取得済みの前後24時間へ広げ、DBのstatusを変更せずに開始待ちを維持する。
進行中・終端の既存表示条件とAPI集計は維持する。

- 表示範囲の過去24時間境界を回帰テストへ追加。
- 即時再送相当の予定時刻がGETより前でも、初回・mutation後の再取得で残ることをHookテストで確認。

## 画面証跡

すべて合成データ。Desktopの`recwatch-evidence/issue-343/`にも原本を保存する。

| 内容                 | 証跡                                                                           |
| -------------------- | ------------------------------------------------------------------------------ |
| 削除後の一覧・Toast  | [ui-delete.png](../images/issue-343/ui-delete.png)                             |
| 取消後の通知本文維持 | [ui-cancel.png](../images/issue-343/ui-cancel.png)                             |
| 再送Schedule表示     | [ui-resend.png](../images/issue-343/ui-resend.png)                             |
| Stop後の状態         | [ui-stop.png](../images/issue-343/ui-stop.png)                                 |
| 取消409              | [ui-cancel-conflict.png](../images/issue-343/ui-cancel-conflict.png)           |
| 完了時のStop実行不可 | [ui-stop-preflight.png](../images/issue-343/ui-stop-preflight.png)             |
| 更新失敗             | [ui-background-error.png](../images/issue-343/ui-background-error.png)         |
| 更新回復             | [ui-background-recovered.png](../images/issue-343/ui-background-recovered.png) |
| 遅延GET後の削除維持  | [ui-delayed-delete.png](../images/issue-343/ui-delayed-delete.png)             |

日時指定再送の画面: [ui-resend-scheduled.png](../images/issue-343/ui-resend-scheduled.png)。

## ローカル回帰検証

- 全152 files / 841 tests成功。Monitor関連4 files / 69 testsも成功。
- format / lint / typecheck / production build成功。build時の法務ページ成果物検証も成功。

## 残る確認

- Calendar表示中の遅延GET・削除は未確認（今回の実操作は一覧表示）。
- Stop POST409は初回HTTP検証で確認済み。今回の画面では自動更新により送信前に実行不可となった。
- Workerの実claim / 配信完了との競合、Gathering削除hook #449のautomatic経路。
- 実Retry、Queue Consumer、FCM認証・送信、completed到達、端末受信。
- 通常App shellを含むMicrosoft実認証とPRレビュー。

上記の残条件があるため#343はCloseせず、PR #423はDraftを維持する。
