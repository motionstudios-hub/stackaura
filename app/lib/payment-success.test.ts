import test from "node:test";
import assert from "node:assert/strict";
import {
  isExplicitSignupPayment,
  resolvePaymentSuccessContent,
} from "./payment-success.ts";

test("normal Paystack payments use generic success copy", () => {
  const content = resolvePaymentSuccessContent({
    gateway: "PAYSTACK",
    metadata: {
      flow: "payment",
    },
  });

  assert.equal(content.title, "Payment successful");
  assert.equal(content.description, "Your payment was completed successfully");
  assert.equal(content.primaryHref, "/");
  assert.equal(content.secondaryHref, "/contact");
});

test("explicit signup flow keeps merchant activation copy", () => {
  const content = resolvePaymentSuccessContent({
    gateway: "OZOW",
    metadata: {
      flow: "merchant_signup",
    },
  });

  assert.equal(content.title, "Merchant account activated");
  assert.equal(
    content.description,
    "Your payment was completed successfully, and your Stackaura merchant workspace is now active."
  );
  assert.equal(content.primaryHref, "/login");
});

test("signup metadata object is treated as an explicit signup signal", () => {
  assert.equal(
    isExplicitSignupPayment({
      gateway: "YOCO",
      metadata: {
        signup: {
          email: "merchant@example.com",
        },
      },
    }),
    true
  );
});

test("Ozow and Yoco payments without signup metadata stay on generic copy", () => {
  assert.equal(
    isExplicitSignupPayment({
      gateway: "OZOW",
      metadata: {
        flow: "payment",
      },
    }),
    false
  );

  assert.equal(
    isExplicitSignupPayment({
      gateway: "YOCO",
      metadata: null,
    }),
    false
  );
});
