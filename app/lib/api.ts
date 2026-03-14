export const API_BASE = "/api/proxy";

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await parseJsonSafe(res);
    throw new Error(typeof body === "string" ? body : JSON.stringify(body));
  }

  return parseJsonSafe(res);
}

export function centsToMoney(amountCents: number, currency: string) {
  const amount = (amountCents / 100).toFixed(2);
  return `${currency} ${amount}`;
}