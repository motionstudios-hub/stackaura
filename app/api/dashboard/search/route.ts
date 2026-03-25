import { NextRequest, NextResponse } from "next/server";
import { buildDashboardSearchResults, getSelectedMerchantWorkspace } from "@/app/dashboard/console-data";

export async function GET(req: NextRequest) {
  const workspace = await getSelectedMerchantWorkspace();
  if (!workspace?.selectedMerchantId) {
    return NextResponse.json({ results: [] }, { status: 401 });
  }

  const query = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const results = await buildDashboardSearchResults(workspace.selectedMerchantId, query);
  return NextResponse.json({ results });
}
