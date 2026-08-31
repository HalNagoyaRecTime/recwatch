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

| 対象               | `VITE_BACKEND_BASE_URL` の注入元          | 設定する値              |
| ------------------ | ----------------------------------------- | ----------------------- |
| `main` ブランチ    | GitHub Actions の本番デプロイワークフロー | 本番 Backend の公開 URL |
| `develop` ブランチ | GitHub Actions の開発デプロイワークフロー | 開発 Backend の公開 URL |
| ローカル開発       | `.env`                                    | ローカル Backend の URL |

GitHub Actions では、`npm run build` を実行するジョブに対象ブランチ用の
`VITE_BACKEND_BASE_URL` を渡す。環境変数は Vite のビルド時に埋め込まれるため、
値を変更した後は対象ブランチを再デプロイする。

`VITE_` で始まる変数はブラウザへ公開されるため、Backend の公開 URL のみを設定し、
認証情報などの秘密情報は設定しない。

### GitHub Actions と Cloudflare の事前設定

`.github/workflows/deploy-cloudflare-pages.yml` は、GitHub Actions 上でビルドし、
Wrangler CLI で Cloudflare Pages へデプロイする。

GitHub では以下を設定する。

- `production` Environment に `VITE_BACKEND_BASE_URL`（本番 Backend の公開 URL）
- `development` Environment に `VITE_BACKEND_BASE_URL`（開発 Backend の公開 URL）
- リポジトリ Secret `CLOUDFLARE_API_TOKEN`（Pages Write 権限を持つ API トークン）
- リポジトリ Secret `CLOUDFLARE_ACCOUNT_ID`（Cloudflare アカウント ID）

Cloudflare Pages の Git 連携による自動デプロイは全ブランチで無効化する。
以後は GitHub Actions が `main` と `develop` の push をデプロイする。

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
- `pre-push`: `npm run check`、`npm test`、`npm run build`
- リモートブランチ削除だけの push では `pre-push` の検査をスキップする

フックを手動で再設定する場合は `npm run prepare` を実行する。


<!-- Work経由のGitHub操作確認用 -->
