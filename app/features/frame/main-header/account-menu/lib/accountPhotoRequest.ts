export type AccountPhotoResponse = {
  blob: Blob;
  contentType: string;
};

type Fetcher = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>;

const missingPhotos = new Set<string>();
const inFlightRequests = new Map<
  string,
  Promise<AccountPhotoResponse | null>
>();

export function requestAccountPhoto(
  userId: string,
  url: string,
  init: RequestInit,
  fetcher: Fetcher = fetch
): Promise<AccountPhotoResponse | null> {
  const key = `${userId}:${url}`;
  if (missingPhotos.has(key)) return Promise.resolve(null);

  const currentRequest = inFlightRequests.get(key);
  if (currentRequest) return currentRequest;

  const request = fetchAccountPhoto(key, url, init, fetcher).finally(() => {
    inFlightRequests.delete(key);
  });
  inFlightRequests.set(key, request);
  return request;
}

export function clearAccountPhotoRequestState() {
  missingPhotos.clear();
  inFlightRequests.clear();
}

async function fetchAccountPhoto(
  key: string,
  url: string,
  init: RequestInit,
  fetcher: Fetcher
): Promise<AccountPhotoResponse | null> {
  const response = await fetcher(url, init).catch(() => null);
  if (!response) return null;

  if (response.status === 404 || response.status === 410) {
    missingPhotos.add(key);
    return null;
  }
  if (!response.ok) return null;

  const blob = await response.blob();
  if (blob.size === 0) return null;

  return {
    blob,
    contentType:
      blob.type || response.headers.get("Content-Type") || "image/jpeg",
  };
}
