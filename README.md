# recwatch

---

管理画面

### 起動

```bash
npm install
npm run typecheck
npm run dev
```

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
