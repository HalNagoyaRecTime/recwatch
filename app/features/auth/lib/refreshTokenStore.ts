// POST /auth/microsoft/token・POST /auth/refresh から取得した
// refresh_token_id をlocalStorageに永続化する。ページリロードや
// アクセストークン失効後も、再ログイン無しでアクセストークンを
// 再発行できるようにするための識別子(値自体に権限は無い)。
const STORAGE_KEY = "rectime_refresh_token_id";

function hasLocalStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function getRefreshTokenId(): string | null {
  if (!hasLocalStorage()) {
    return null;
  }

  return window.localStorage.getItem(STORAGE_KEY);
}

export function setRefreshTokenId(id: string | null): void {
  if (!hasLocalStorage()) {
    return;
  }

  if (id) {
    window.localStorage.setItem(STORAGE_KEY, id);
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}
