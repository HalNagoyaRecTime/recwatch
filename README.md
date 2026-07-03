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

## その他のコマンド

```bash
# 型チェック
npm run typecheck

# Lint
npm run lint

# フォーマット
npm run format
```
