import test from "node:test";
import assert from "node:assert/strict";
import { normalizeRedirectPayload } from "./payment-redirect.ts";

test("normalizes direct redirect URLs", () => {
  assert.deepEqual(
    normalizeRedirectPayload({
      redirectUrl: "https://pay.example/redirect",
    }),
    {
      url: "https://pay.example/redirect",
      method: "GET",
    }
  );
});

test("normalizes redirect form payloads for Ozow style POST handoffs", () => {
  assert.deepEqual(
    normalizeRedirectPayload({
      redirectForm: {
        action: "https://pay.ozow.com",
        method: "POST",
        fields: {
          SiteCode: "SC-123",
          hashCheck: "abc123",
        },
      },
    }),
    {
      url: "https://pay.ozow.com",
      method: "POST",
      fields: {
        SiteCode: "SC-123",
        hashCheck: "abc123",
      },
    }
  );
});
