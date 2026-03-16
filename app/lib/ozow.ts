"use client";

type RedirectMethod = "GET" | "POST";

type RedirectInstruction = {
  url: string;
  method?: RedirectMethod;
  fields?: Record<string, string>;
};

type OzowRedirectResponse =
  | {
      redirectUrl: string;
    }
  | {
      redirect: RedirectInstruction;
    }
  | {
      action: string;
      method?: RedirectMethod;
      fields?: Record<string, string>;
    }
  | {
      redirectForm: RedirectInstruction;
    }
  | {
      redirectForm: {
        action: string;
        method?: RedirectMethod;
        fields?: Record<string, string>;
      };
    };

export type OzowInitiateRequest = {
  flow: "merchant_signup";
  signup: {
    businessName: string;
    email: string;
    password: string;
    country: string;
  };
  returnUrls: {
    success: string;
    cancel: string;
    error: string;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getApiBase() {
  const value = process.env.NEXT_PUBLIC_API_BASE;
  if (!value) {
    throw new Error("Payment API base is not configured.");
  }
  return value.replace(/\/+$/, "");
}

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function extractErrorMessage(payload: unknown) {
  if (typeof payload === "string" && payload) return payload;
  if (!isRecord(payload)) return null;

  if (typeof payload.message === "string" && payload.message) return payload.message;
  if (typeof payload.error === "string" && payload.error) return payload.error;

  if (Array.isArray(payload.message) && payload.message.every((item) => typeof item === "string")) {
    return payload.message.join(", ");
  }

  return null;
}

function normalizeRedirectPayload(payload: unknown): RedirectInstruction | null {
  if (!isRecord(payload)) return null;

  if (typeof payload.redirectUrl === "string" && payload.redirectUrl) {
    return {
      url: payload.redirectUrl,
      method: "GET",
    };
  }

  if (isRecord(payload.redirect) && typeof payload.redirect.url === "string") {
    return {
      url: payload.redirect.url,
      method:
        payload.redirect.method === "POST" || payload.redirect.method === "GET"
          ? payload.redirect.method
          : "GET",
      fields: isRecord(payload.redirect.fields)
        ? Object.fromEntries(
            Object.entries(payload.redirect.fields).filter(
              (entry): entry is [string, string] => typeof entry[1] === "string"
            )
          )
        : undefined,
    };
  }

  if (typeof payload.action === "string" && payload.action) {
    return {
      url: payload.action,
      method: payload.method === "POST" || payload.method === "GET" ? payload.method : "POST",
      fields: isRecord(payload.fields)
        ? Object.fromEntries(
            Object.entries(payload.fields).filter(
              (entry): entry is [string, string] => typeof entry[1] === "string"
            )
          )
        : undefined,
    };
  }

  if (isRecord(payload.redirectForm)) {
    if (typeof payload.redirectForm.url === "string" && payload.redirectForm.url) {
      return {
        url: payload.redirectForm.url,
        method:
          payload.redirectForm.method === "POST" || payload.redirectForm.method === "GET"
            ? payload.redirectForm.method
            : "GET",
        fields: isRecord(payload.redirectForm.fields)
          ? Object.fromEntries(
              Object.entries(payload.redirectForm.fields).filter(
                (entry): entry is [string, string] => typeof entry[1] === "string"
              )
            )
          : undefined,
      };
    }

    if (typeof payload.redirectForm.action === "string" && payload.redirectForm.action) {
      return {
        url: payload.redirectForm.action,
        method:
          payload.redirectForm.method === "POST" || payload.redirectForm.method === "GET"
            ? payload.redirectForm.method
            : "POST",
        fields: isRecord(payload.redirectForm.fields)
          ? Object.fromEntries(
              Object.entries(payload.redirectForm.fields).filter(
                (entry): entry is [string, string] => typeof entry[1] === "string"
              )
            )
          : undefined,
      };
    }
  }

  return null;
}

function submitRedirect(instruction: RedirectInstruction) {
  if (instruction.method === "POST") {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = instruction.url;
    form.style.display = "none";

    for (const [key, value] of Object.entries(instruction.fields ?? {})) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
    return;
  }

  window.location.assign(instruction.url);
}

export async function initiateOzowSignupPayment(payload: OzowInitiateRequest) {
  const res = await fetch(`${getApiBase()}/payments/ozow/initiate`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await parseJsonSafe(res);

  if (!res.ok) {
    throw new Error(extractErrorMessage(body) || "Unable to start Ozow checkout right now.");
  }

  const redirect = normalizeRedirectPayload(body as OzowRedirectResponse);
  if (!redirect) {
    throw new Error("The payment service did not return a usable redirect.");
  }

  submitRedirect(redirect);
}
