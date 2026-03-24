"use client";

import { useEffect, useRef } from "react";
import { trackMetaEvent, type MetaPixelParams } from "../lib/meta-pixel";

export default function MetaPixelEvent({
  eventName,
  params,
}: {
  eventName: string;
  params?: MetaPixelParams;
}) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    trackMetaEvent(eventName, params);
    hasTracked.current = true;
  }, [eventName, params]);

  return null;
}
