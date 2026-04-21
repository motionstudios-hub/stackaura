import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  url.pathname = "/shopify";
  return NextResponse.redirect(url);
}
