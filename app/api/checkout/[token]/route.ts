import { NextRequest, NextResponse } from "next/server";
import { fetchServerApi } from "@/app/lib/server-api";

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
  let res: Response;
  try {
    res = await fetchServerApi(`/v1/checkout/${encodeURIComponent(token)}${url.search}`, {
      headers: {
        accept: "application/json",
      },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Checkout service unavailable. Please try again shortly." },
      { status: 503 }
    );
  }

  const body = await res.arrayBuffer();
  return new NextResponse(body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
