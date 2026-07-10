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

Cloudflare Pages の Settings > Environment variables で、同じ変数名に
環境ごとの Backend URL を設定する。

| 対象               | Cloudflare Pages 環境 | `VITE_BACKEND_BASE_URL` |
| ------------------ | --------------------- | ----------------------- |
| `main` ブランチ    | Production            | 本番 Backend の公開 URL |
| `develop` ブランチ | Preview               | 開発 Backend の公開 URL |
| ローカル開発       | `.env`                | ローカル Backend の URL |

`main` を Production branch に設定し、`develop` は Preview deployment として
デプロイする。環境変数は Vite のビルド時に埋め込まれるため、値を変更した後は
対象ブランチを再デプロイする。

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
