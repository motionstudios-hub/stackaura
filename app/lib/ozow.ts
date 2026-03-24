"use client";

import {
  normalizeRedirectPayload,
  submitRedirect,
  type RedirectInstruction,
  type RedirectMethod,
} from "./payment-redirect";

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

export async function initiateOzowSignupPayment(payload: OzowInitiateRequest) {
  const res = await fetch("/api/payments/ozow/initiate", {
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
