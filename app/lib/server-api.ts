import "server-only";

const LOCAL_API_FALLBACK = "http://127.0.0.1:3001";
const DEFAULT_TIMEOUT_MS = 8000;

function normalizeBaseUrl(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\/+$/, "");
}

export function getServerApiBase() {
  return (
    normalizeBaseUrl(process.env.CHECKOUT_API_URL) ||
    normalizeBaseUrl(process.env.CHECKOUT_API_BASE_URL) ||
    normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE) ||
    normalizeBaseUrl(process.env.NEXT_PUBLIC_CHECKOUT_API_BASE_URL) ||
    LOCAL_API_FALLBACK
  );
}

export function getServerApiTimeoutMs() {
  const parsed = Number(process.env.BACKEND_FETCH_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_TIMEOUT_MS;
  }

  return Math.trunc(parsed);
}

export function buildServerApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getServerApiBase()}${normalizedPath}`;
}

export async function fetchServerApi(path: string, init?: RequestInit) {
  return fetch(buildServerApiUrl(path), {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(getServerApiTimeoutMs()),
  });
}

export function isBackendUnavailableError(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === "AbortError" ||
      error.name === "TimeoutError" ||
      /fetch failed/i.test(error.message) ||
      /timed out/i.test(error.message) ||
      /econnrefused/i.test(error.message) ||
      /enotfound/i.test(error.message))
  );
}
