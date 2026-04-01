"use client";

import { useEffect, useRef } from "react";
import {
  trackGoogleEvent,
  type GoogleAnalyticsEventParams,
} from "../lib/google-analytics";

export default function GoogleAnalyticsEvent({
  eventName,
  params,
}: {
  eventName: string;
  params?: GoogleAnalyticsEventParams;
}) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    trackGoogleEvent(eventName, params);
    hasTracked.current = true;
  }, [eventName, params]);

  return null;
}
