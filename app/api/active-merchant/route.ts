import { NextRequest, NextResponse } from "next/server";
import { fetchServerApi } from "@/app/lib/server-api";

export async function GET(req: NextRequest) {
  const cookieMerchantId = req.cookies.get("active_merchant_id")?.value || null;
  if (cookieMerchantId) {
    return NextResponse.json({ merchantId: cookieMerchantId });
  }

  const cookieHeader = req.headers.get("cookie") || "";

  try {
    const res = await fetchServerApi("/v1/auth/me", {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ merchantId: null });
    }

    const data = await res.json();
    const fallbackMerchantId = data?.memberships?.[0]?.merchant?.id || null;
    return NextResponse.json({ merchantId: fallbackMerchantId });
  } catch {
    return NextResponse.json({ merchantId: null });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const merchantId = String(body?.merchantId || "").trim();

  if (!merchantId) {
    return NextResponse.json({ ok: false, message: "merchantId required" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true, merchantId });
  res.cookies.set("active_merchant_id", merchantId, {
    httpOnly: false, // can be true later; keeping false is fine for now
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}
