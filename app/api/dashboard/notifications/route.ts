import { NextResponse } from "next/server";
import {
  buildDashboardNotifications,
  getSelectedMerchantWorkspace,
  getWorkspaceAnalytics,
} from "@/app/dashboard/console-data";

export async function GET() {
  const workspace = await getSelectedMerchantWorkspace();
  if (!workspace?.selectedMerchantId) {
    return NextResponse.json({ items: [] }, { status: 401 });
  }

  const analytics = await getWorkspaceAnalytics(workspace.selectedMerchantId);
  const items = await buildDashboardNotifications(workspace.selectedMerchantId, analytics);

  return NextResponse.json({ items });
}
