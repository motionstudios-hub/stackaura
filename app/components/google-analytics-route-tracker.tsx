"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackPageView } from "../lib/google-analytics";

export default function GoogleAnalyticsRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasSeenInitialRoute = useRef(false);

  useEffect(() => {
    if (!pathname) return;

    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    if (!hasSeenInitialRoute.current) {
      hasSeenInitialRoute.current = true;
      return;
    }

    trackPageView(pagePath);
  }, [pathname, searchParams]);

  return null;
}
