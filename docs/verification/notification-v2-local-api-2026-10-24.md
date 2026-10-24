# Notification v2 隔離API確認（2026-10-24）

関連: #343 / PR #423。実HTTP境界の部分確認であり、画面E2E完了ではない。

## 対象と検証境界

- recwatch develop: `b1abab37b47c5bdba2b819f1094b8b2124a79c3d`。
- Backend develop: `d7b9fe1d3a80a3a76c8720e2ae4ae90aae783172`（#562 / #558を含む）。
- 別checkoutのWrangler localに、実環境のIDを使わないD1 / KV / R2 / Queueを作成した。
- 既存MigrationをローカルD1へ適用し、合成staff・Recipientを用意した。実ユーザー・実Token・Firebase資格情報は使用していない。
- 本番のHTTP adapter、Request / Response validator・parser、共通apiClientをVite SSRで読み込み、同一メモリのaccessTokenStoreにローカル検証用の合成web JWTを設定した。
- 通信はfetchの実HTTP。観測用wrapperはmethod / path / status / body有無だけを記録し、応答をMockへ差し替えていない。
- 後半では本番Route moduleを隔離検証用shellに描画し、ブラウザーの画面操作も確認した。Microsoftログイン、FCM送信、実利用端末は未確認。

## 確認結果

| 確認単位                           | 結果                                                                                      | 限界                                                    |
| ---------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| config / audience-count            | 許可importanceとRecipient 1人を取得                                                       | 合成staff / user対象                                    |
| 予約作成・一覧・詳細・期間指定一覧 | 201のID、本文の改行、scheduled、期間指定GETを確認                                         | Calendar画面は未確認                                    |
| 開始前編集                         | push / detail / importance / audience / deliveryをPATCHし、GETで確認                      | 入力画面の実API操作は未確認                             |
| immediate / scheduled再送          | 元Scheduleを残し、新しいIDとScheduleをGETで確認                                           | FCM配信は未実施                                         |
| 未開始取消                         | 204後のSchedule 404、Notificationの残存を確認                                             | 画面とWorkerの競合は未確認                              |
| 未開始Notification削除             | 204後の404、一覧からの消去を確認                                                          | 遅延GETとの競合はMockのみ                               |
| sending / Results / retry_wait     | Recipient 2人とDelivery 3件を区別、空Delivery、削除済みTokenのnullをparser経由で確認      | DBに状態fixtureを準備。実配信・Retry生成ではない        |
| 開始済み編集・削除・取消           | 409を取得。detailだけの編集は200                                                          | Workerの同時claimではなく開始済みfixture                |
| Stop                               | bodyなしPOST、ID / stopped応答、GETのactor / reason、未送信2件停止・送信済み1件保持を確認 | sendingは状態fixture                                    |
| completed / 二重Stop               | 409を確認                                                                                 | 完了との実競合ではない                                  |
| source不在automatic                | source.label=null、再送409                                                                | source不在fixture。Gathering削除hook #449の確認ではない |
| 未許可importance                   | highの作成で403。configで許可されたnormalは成功                                           | 権限条件は合成staff                                     |
| Backend validation                 | 共通apiClientで不正importanceの400を確認                                                  | Form inlineはRoute Mockテストのみ                       |
| 実Cron・TokenなしRecipient         | Recipient確定後の人数1・Delivery 0、Resultsの空配列を確認                                 | 配信完了は未達。下記参照                                |

上記14確認単位が成功した。全N01〜N19の成功を意味しない。
APIのmethod / path / statusは[HTTP証跡](notification-v2-local-api-2026-10-24.json)を参照する。
HTTP 400確認はadapterの事前validationを迂回して共通apiClientから行い、Backendの400応答自体を確認した。

## Cronで確認できなかったこと

初回はToken 0件のScheduleがcompletedへ進むことまで期待したが、Firebase設定を入れていないため、
実CronはRecipient確定後のresolvingで止まった。BackendはDelivery準備前にFCM設定・認証を検証するためである。
設定を迂回するStubや本物のFirebase資格情報は追加していない。

再確認の成功範囲は「実CronによるRecipient確定と、Delivery 0件のResults取得」まで。
completedへの到達、Queue Consumer、Retry、FCM・端末配信は未確認として残す。

## Route Mockの追従

最新developの厳格なResponse検証に合わせ、既存のRoute統合Mockを修正した。

- 一覧Responseから詳細専用のupdatedAt / content.detail / schedules.stopを除去した。
- 予約Requestのoffset付き日時を、実BackendのResponseと同じUTC ISO表記へ正規化した。
- 本番validatorを緩和せず、Mockと実APIの契約を一致させた。Route統合7件は成功。

## 再確認手順

1. 両RepositoryのSHAを記録し、実環境のBindingや設定ファイルを使わない別のWrangler localを作る。
2. 最新MigrationをローカルD1へ適用し、合成userとstaffを作る。認証はローカル専用JWTを使用する。
3. 本番adapterの既定clientを使い、作成・GET・PATCH・再送・取消・削除を順に実行する。
4. 競合前提の確認にはローカルD1でstarted_at / status / Recipient / Deliveryの状態を準備する。実Worker競合と記録を分ける。
5. Stop後と409後にGETし、status・監査・集計・元Scheduleの保持を確認する。
6. Token 0件の通知では実Cronを1回呼び、Recipient確定とResultsを確認する。FCM設定を使わない場合、配信終端を成功扱いにしない。
7. 次回は画面E2E、遅延GET・自動更新失敗、Worker実競合、FCM・端末配信を別途実施する。

## ブラウザーでの実API操作

Microsoft認証と通常のApp shellを含まないローカル検証shellに、本番の作成・一覧・詳細・編集・Monitor Route moduleを描画した。
共通apiClientは実HTTPのまま、Backend側は合成staff JWTを通常の認証Middlewareで検証した。

- 予約作成（Notification #12 / Schedule #16）→ 詳細で本文の段落・強調表示 → Calendarの10/25 13:00への反映 → 詳細への遷移を確認。
- 即時作成（Notification #13 / Schedule #17）→ 詳細 → 一覧の操作メニュー → 編集 → 保存 → 更新後の詳細を確認。
- 編集では作成時刻が既に過去になった予約入力のinline validationを確認。今すぐ配信を選び直した後、詳細title / bodyの保存が成功した。
- 作成・更新の成功Toastを確認し、操作通知履歴には追加されないことを確認。
- 状態fixture（Notification #3 / Schedule #5）をMonitorで表示。Recipient 2、Delivery 3、sent 1、stopped 2をAPI値と一致して表示。
- Monitorの詳細dialog → 通知詳細 → 対象者・配信結果でTokenなしRecipientと3件のDeliveryを確認し、Delivery詳細dialogも表示。
- 削除・取消・Stop・再送のHTTP確認は上記14確認単位で実施したが、それらの画面mutationは未実施。
- 遅延GET、Worker実競合、background更新失敗、実Retry、FCM送信・端末受信は残る。

## 画面証跡

すべて合成データのローカル画面。Desktopの`recwatch-evidence/issue-343/`にも原本を保存した。

| 内容                     | 証跡                                                           |
| ------------------------ | -------------------------------------------------------------- |
| 予約作成後の詳細         | [detail.png](../images/issue-343/detail.png)                   |
| Calendar反映             | [calendar.png](../images/issue-343/calendar.png)               |
| Monitor停止集計          | [monitor-stopped.png](../images/issue-343/monitor-stopped.png) |
| Recipient / Delivery結果 | [results.png](../images/issue-343/results.png)                 |
| Delivery詳細             | [delivery.png](../images/issue-343/delivery.png)               |
| 編集保存後の詳細         | [edited.png](../images/issue-343/edited.png)                   |

## ローカル回帰検証

- Route統合7件を含む全152 files / 838 tests成功。
- format / lint / typecheck / buildを確認した。
- PRへの反映はユーザー指示により保留。画面証跡もまだGitHubへ投稿していない。
