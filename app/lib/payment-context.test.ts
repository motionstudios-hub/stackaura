import test from "node:test";
import assert from "node:assert/strict";
import {
  injectMerchantIdIntoPaymentBody,
  resolvePaymentProxyContext,
} from "./payment-context.ts";

test("active merchant context stays authoritative over an API key override", () => {
  const resolved = resolvePaymentProxyContext({
    activeMerchantId: "merch_active",
    incomingAuthorization: "Bearer ck_test_merchant_key",
  });

  assert.deepEqual(resolved, {
    ok: true,
    mode: "dashboard-merchant",
    authorization: null,
    merchantId: "merch_active",
  });
});

test("dashboard merchant context injects the active merchant when no merchant API key is supplied", () => {
  const resolved = resolvePaymentProxyContext({
    activeMerchantId: "merch_dashboard",
    incomingAuthorization: null,
  });

  assert.deepEqual(resolved, {
    ok: true,
    mode: "dashboard-merchant",
    authorization: null,
    merchantId: "merch_dashboard",
  });
});

test("dashboard merchant payment body is forced to the active merchant id", () => {
  const body = injectMerchantIdIntoPaymentBody(
    JSON.stringify({
      amountCents: 2500,
      currency: "ZAR",
      merchantId: "spoofed_merchant",
      gateway: "OZOW",
    }),
    "merch_dashboard"
  );

  assert.deepEqual(JSON.parse(body), {
    amountCents: 2500,
    currency: "ZAR",
    merchantId: "merch_dashboard",
    gateway: "OZOW",
  });
});

test("payment creation requires either a merchant API key or an active merchant", () => {
  const resolved = resolvePaymentProxyContext({
    activeMerchantId: null,
    incomingAuthorization: null,
  });

  assert.deepEqual(resolved, {
    ok: false,
    status: 400,
    message:
      "Provide a merchant API key or select an active merchant before creating a payment.",
  });
});
