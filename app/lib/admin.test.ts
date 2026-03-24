import test from "node:test";
import assert from "node:assert/strict";
import { isPlatformAdminEmail, resolvePlatformAdminEmails } from "./admin-access.ts";

const originalEnv = { ...process.env };

test.afterEach(() => {
  process.env = { ...originalEnv };
});

test("resolvePlatformAdminEmails merges configured admin env values", () => {
  process.env.STACKAURA_ADMIN_EMAILS = "owner@stackaura.co.za, ops@stackaura.co.za";
  process.env.ADMIN_EMAIL = "admin@stackaura.co.za";

  assert.deepEqual(resolvePlatformAdminEmails(), [
    "owner@stackaura.co.za",
    "ops@stackaura.co.za",
    "admin@stackaura.co.za",
  ]);
});

test("isPlatformAdminEmail is case-insensitive", () => {
  process.env.STACKAURA_ADMIN_EMAILS = "owner@stackaura.co.za";

  assert.equal(isPlatformAdminEmail("OWNER@stackaura.co.za"), true);
  assert.equal(isPlatformAdminEmail("merchant@example.com"), false);
});
