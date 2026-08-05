// POST /auth/microsoft/token (client_type: web) で取得したBearerアクセス
// トークンをメモリに保持する。Cookie/サーバーセッションは使用せず、この
// トークンがAPI呼び出し(apiClient)における認証情報の実体となる。
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}
