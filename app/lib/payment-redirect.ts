export type RedirectMethod = "GET" | "POST";

export type RedirectInstruction = {
  url: string;
  method: RedirectMethod;
  fields?: Record<string, string>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function sanitizeFields(value: unknown) {
  if (!isRecord(value)) return undefined;

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string"
    )
  );
}

function normalizeMethod(value: unknown, fallback: RedirectMethod): RedirectMethod {
  return value === "POST" || value === "GET" ? value : fallback;
}

export function normalizeRedirectPayload(payload: unknown): RedirectInstruction | null {
  if (!isRecord(payload)) return null;

  if (isRecord(payload.redirect) && typeof payload.redirect.url === "string") {
    return {
      url: payload.redirect.url,
      method: normalizeMethod(payload.redirect.method, "GET"),
      fields: sanitizeFields(payload.redirect.fields),
    };
  }

  if (typeof payload.action === "string" && payload.action) {
    return {
      url: payload.action,
      method: normalizeMethod(payload.method, "POST"),
      fields: sanitizeFields(payload.fields),
    };
  }

  if (isRecord(payload.redirectForm)) {
    if (typeof payload.redirectForm.url === "string" && payload.redirectForm.url) {
      return {
        url: payload.redirectForm.url,
        method: normalizeMethod(payload.redirectForm.method, "GET"),
        fields: sanitizeFields(payload.redirectForm.fields),
      };
    }

    if (typeof payload.redirectForm.action === "string" && payload.redirectForm.action) {
      return {
        url: payload.redirectForm.action,
        method: normalizeMethod(payload.redirectForm.method, "POST"),
        fields: sanitizeFields(payload.redirectForm.fields),
      };
    }
  }

  if (typeof payload.redirectUrl === "string" && payload.redirectUrl) {
    return {
      url: payload.redirectUrl,
      method: "GET",
    };
  }

  return null;
}

export function submitRedirect(instruction: RedirectInstruction) {
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
