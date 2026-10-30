# recwatch

RecTime 管理画面フロントエンド（React Router v7）

---

## 必要環境

- Node.js v22 以上（[nvm](https://github.com/nvm-sh/nvm) 推奨）
- rectime-api（バックエンド）の起動

---

## ローカル開発セットアップ

### 1. 依存関係インストール

```bash
npm install
```

### 2. 環境変数の設定

```bash
cp .env.example .env
```

`.env` を編集して以下を設定する:

| 変数                    | 説明               | デフォルト              |
| ----------------------- | ------------------ | ----------------------- |
| `VITE_BACKEND_BASE_URL` | rectime-api の URL | `http://localhost:8787` |

### 3. バックエンドの起動

`rectime-api` のセットアップを完了させ、バックエンドを起動しておく（`http://localhost:8787`）。

セットアップ手順は [rectime-api の README](../rectime-api/README.md) を参照。

### 4. 起動

```bash
npm run dev
```

`http://localhost:5173` でアプリが起動する。

---

### プロダクションビルド

recwatchはReact RouterのSPAモードで動作する。

```bash
npm run build
npm run preview
```

ビルド成果物は`build/client`に生成される。

### Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `build/client`
- Deploy command: 設定しない

GitHub Actions のデプロイワークフローで、ビルド時に
`VITE_BACKEND_BASE_URL` を注入する。

| デプロイ先  | 契機                                    | URL                                        |
| ----------- | --------------------------------------- | ------------------------------------------ |
| production  | `main` でデプロイワークフローを手動実行 | `https://<プロジェクト>.pages.dev`         |
| staging     | `develop` への push                     | `https://staging.<プロジェクト>.pages.dev` |
| development | `develop` への push                     | `https://develop.<プロジェクト>.pages.dev` |
| preview     | PR                                      | `https://pr-<PR番号>.recwatch.pages.dev`   |

`<プロジェクト>` は学校ごとの Pages プロジェクト（名古屋 `recwatch`・東京
`recwatch-tokyo`・大阪 `recwatch-osaka`）。preview は名古屋だけにデプロイする。

ローカル開発では `.env` の `VITE_BACKEND_BASE_URL` を使う。

GitHub Actions では、`npm run build` を実行するジョブにデプロイ先の
GitHub Environment の `VITE_BACKEND_BASE_URL_<学校>` を `VITE_BACKEND_BASE_URL` として渡す。
環境変数は Vite のビルド時に埋め込まれるため、値を変更した後は再デプロイする。

`VITE_` で始まる変数はブラウザへ公開されるため、Backend の公開 URL のみを設定し、
認証情報などの秘密情報は設定しない。

### GitHub Actions と Cloudflare の事前設定

`.github/workflows/deploy-cloudflare-pages.yml` は、GitHub Actions 上でビルドし、
Wrangler CLI で Cloudflare Pages へデプロイする。

GitHub では以下を設定する。

`<学校>` は `NAGOYA`・`TOKYO`・`OSAKA`。

- `production`・`staging`・`development`・`preview` の各 Environment に `VITE_BACKEND_BASE_URL_<学校>`（デプロイ先に対応する Backend の公開 URL。preview は `NAGOYA` だけ）
- リポジトリ Secret `CLOUDFLARE_API_TOKEN_<学校>`（その学校の Cloudflare アカウントで Pages Write 権限を持つ API トークン）
- リポジトリ Secret `CLOUDFLARE_ACCOUNT_ID_<学校>`（その学校の Cloudflare アカウント ID）

Cloudflare Pages の Git 連携による自動デプロイは全ブランチで無効化する。
以後は GitHub Actions がデプロイする。

Cloudflare PagesのSPAフォールバックを使用するため、トップレベルの
`404.html`は配置しない。

ブラウザからバックエンドAPIへ直接アクセスするため、
`VITE_BACKEND_BASE_URL`には公開可能なAPIのURLを設定し、
バックエンド側でCloudflare PagesのオリジンをCORS許可する。

---

## その他のコマンド

```bash
# 型チェック
npm run typecheck

# Lint
npm run lint

# フォーマット
npm run format
```

### Git hooks

`npm install` の `prepare` スクリプトで Husky を初期化する。

- `pre-commit`: 変更ファイルのPrettier/ESLint（`lint-staged`）
- `pre-push`: 全体Typecheckと、`origin/develop` との差分に影響するVitestのみ実行する
  - `package.json`、`package-lock.json`、`tsconfig*.json`、Vitest/Vite設定変更時は、pre-pushがGitの差分を判定して全テストを実行する
  - `origin/develop` が見つからない場合は全テストへフォールバックする
  - Stacked PRでも`origin/develop`を基準にするため、実際のPR差分より検査範囲が広がる、または親PRの変更を打ち消すケースでは差分を正確に検出できない場合がある
  - 関連テストは現在チェックアウト中のHEADを基準に選択するため、別ref指定や複数refのpushでは実際のpush対象と完全一致しない場合がある
  - 別ref指定や複数refのpushを検出した場合は、pushを止めずにコンソールへ警告を表示する
- リモートブランチ削除だけの push では `pre-push` の検査をスキップする
- Prettier/ESLintの全体確認、全テスト、buildはCIで実行し、CIを最終的な品質保証とする

フックを手動で再設定する場合は `npm run prepare` を実行する。
