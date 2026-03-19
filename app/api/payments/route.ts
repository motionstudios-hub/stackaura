import { NextRequest, NextResponse } from "next/server";
import {
  ACTIVE_MERCHANT_COOKIE_NAME,
  ACTIVE_MERCHANT_HEADER_NAME,
  injectMerchantIdIntoPaymentBody,
  resolvePaymentProxyContext,
} from "@/app/lib/payment-context";

const API_BASE = process.env.CHECKOUT_API_URL ?? "http://127.0.0.1:3001";
const DASHBOARD_API_KEY = process.env.DASHBOARD_API_KEY ?? process.env.CHECKOUT_API_KEY ?? "";

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
    dashboardApiKey: DASHBOARD_API_KEY,
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

  headers.set("authorization", context.authorization);

  let body = await req.text();
  if (context.mode === "dashboard-merchant") {
    headers.set(ACTIVE_MERCHANT_HEADER_NAME, context.merchantId);

    try {
      body = injectMerchantIdIntoPaymentBody(body, context.merchantId);
    } catch (error) {
      return NextResponse.json(
        {
          message:
            error instanceof Error
              ? error.message
              : "Payment creation expects a JSON object body.",
        },
        { status: 400 }
      );
    }
  }

  const res = await fetch(`${API_BASE}/v1/payments`, {
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
