"use client";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export type MetaPixelParams = Record<string, string | number | boolean | string[] | undefined>;

export function trackMetaEvent(eventName: string, params?: MetaPixelParams) {
  if (typeof window === "undefined") return;
  if (typeof window.fbq !== "function") return;

  if (params && Object.keys(params).length > 0) {
    window.fbq("track", eventName, params);
    return;
  }

  window.fbq("track", eventName);
}
