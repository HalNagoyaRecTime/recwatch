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

Cloudflare PagesのSPAフォールバックを使用するため、トップレベルの
`404.html`は配置しない。

ブラウザからバックエンドAPIへ直接アクセスするため、
`VITE_BACKEND_BASE_URL`には公開可能なAPIのURLを設定し、
バックエンド側でCloudflare PagesのオリジンをCORS許可する。

#### 環境変数とCORS

Cloudflare Pagesでは、フロント環境変数として
`VITE_BACKEND_BASE_URL`を設定する。

| 変数                    | 設定する値                                 |
| ----------------------- | ------------------------------------------ |
| `VITE_BACKEND_BASE_URL` | ブラウザからアクセス可能なrectime-apiのURL |

例:

```text
VITE_BACKEND_BASE_URL=https://rectime-api.rectime-project.workers.dev
```

バックエンド側のCORS許可設定には、APIのURLではなく、実際にブラウザで開く
Cloudflare Pagesのフロントオリジンを設定する。

```text
# フロント環境変数
VITE_BACKEND_BASE_URL=https://rectime-api.rectime-project.workers.dev

# バックエンド側のCORS許可オリジン
ALLOWED_ORIGINS=https://<recwatchのpagesドメイン>
```

develop、preview、productionでCloudflare PagesのURLが異なる場合は、
実際に検証するフロントURLのオリジンをバックエンド側で許可する。
PR previewのURLを利用する場合も、Cloudflare DashboardのURLではなく、
ブラウザで開く`https://...pages.dev`のURLを対象にする。

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
