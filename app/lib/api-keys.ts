export type ApiEnv = "test" | "live";

export type ApiKeyRow = {
  id: string;
  label: string;
  environment?: ApiEnv;
  prefix: string | null;
  last4: string | null;
  revokedAt: string | null;
  createdAt: string;
  secret: string | null;
};

export type ParsedApiKeys = {
  items: ApiKeyRow[];
  revealedSecret: string | null;
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function toNullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

export function resolveEnv(row: Pick<ApiKeyRow, "environment" | "prefix">): ApiEnv {
  if (row.environment === "live" || row.environment === "test") return row.environment;
  const prefix = (row.prefix || "").toLowerCase();
  return prefix.startsWith("ck_live") ? "live" : "test";
}

export function extractApiKeySecret(payload: unknown): string | null {
  if (!isRecord(payload)) return null;

  for (const key of [
    "keyPlain",
    "apiKey",
    "key",
    "secret",
    "initialKeyPlain",
    "initialApiKey",
    "initialKey",
  ] as const) {
    const value = payload[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return null;
}

function toApiKeyRow(value: unknown): ApiKeyRow | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.createdAt !== "string") return null;

  const row: ApiKeyRow = {
    id: value.id,
    label: typeof value.label === "string" && value.label ? value.label : "default",
    environment:
      value.environment === "live" || value.environment === "test"
        ? value.environment
        : undefined,
    prefix: toNullableString(value.prefix),
    last4: toNullableString(value.last4),
    revokedAt: toNullableString(value.revokedAt),
    createdAt: value.createdAt,
    secret: extractApiKeySecret(value),
  };

  return {
    ...row,
    environment: resolveEnv(row),
  };
}

export function parseApiKeys(payload: unknown): ParsedApiKeys {
  const rawList = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.items)
      ? payload.items
      : [];

  return {
    items: rawList
      .map(toApiKeyRow)
      .filter((row): row is ApiKeyRow => row !== null),
    revealedSecret: extractApiKeySecret(payload),
  };
}
