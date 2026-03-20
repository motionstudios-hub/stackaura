import { NextRequest, NextResponse } from "next/server";
import {
  ACTIVE_MERCHANT_COOKIE_NAME,
  ACTIVE_MERCHANT_HEADER_NAME,
  resolvePaymentProxyContext,
} from "@/app/lib/payment-context";

const API_BASE = process.env.CHECKOUT_API_URL ?? "http://127.0.0.1:3001";

function buildResponseHeaders(res: Response) {
  const headers = new Headers();
  headers.set("content-type", res.headers.get("content-type") ?? "application/json");
  return headers;
}

export async function POST(req: NextRequest) {
  const activeMerchantId = req.cookies.get(ACTIVE_MERCHANT_COOKIE_NAME)?.value ?? null;
  const context = resolvePaymentProxyContext({
    activeMerchantId,
    incomingAuthorization: req.headers.get("authorization"),
  });

  if (!context.ok) {
    return NextResponse.json({ message: context.message }, { status: context.status });
  }

  const headers = new Headers();
  headers.set("accept", "application/json");

  const contentType = req.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  const cookie = req.headers.get("cookie");
  const backendPath =
    context.mode === "dashboard-merchant" ? "/v1/payments/dashboard" : "/v1/payments";

  if (context.mode === "dashboard-merchant") {
    headers.set(ACTIVE_MERCHANT_HEADER_NAME, context.merchantId);
    if (cookie) {
      headers.set("cookie", cookie);
    }
  } else {
    headers.set("authorization", context.authorization);
  }

  const body = await req.text();

  const res = await fetch(`${API_BASE}${backendPath}`, {
    method: "POST",
    headers,
    body,
  });

  const responseBody = await res.arrayBuffer();
  return new NextResponse(responseBody, {
    status: res.status,
    headers: buildResponseHeaders(res),
  });
}
