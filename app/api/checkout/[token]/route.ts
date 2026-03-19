import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.CHECKOUT_API_URL ?? "http://127.0.0.1:3001";

type Ctx = {
  params: Promise<{ token: string }> | { token: string };
};

async function getToken(ctx: Ctx) {
  const params = await Promise.resolve(ctx.params);
  return params.token;
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const token = await getToken(ctx);
  const url = new URL(req.url);
  const target = `${API_BASE}/v1/checkout/${encodeURIComponent(token)}${url.search}`;

  const res = await fetch(target, {
    headers: {
      accept: "application/json",
    },
    cache: "no-store",
  });

  const body = await res.arrayBuffer();
  return new NextResponse(body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
