"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { GA_MEASUREMENT_ID } from "./google-analytics-config";

type GoogleAnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

export type GoogleAnalyticsEventParams = Record<
  string,
  | string
  | number
  | boolean
  | string[]
  | number[]
  | GoogleAnalyticsItem[]
  | undefined
>;

export type GoogleAnalyticsItem = {
  item_name: string;
  item_category?: string;
  price: number;
  quantity: number;
  item_id?: string;
};

export type AuthAnalyticsEventParams = GoogleAnalyticsEventParams & {
  method?: string;
  user_id?: string;
};

export type ContactSalesAnalyticsEventParams = GoogleAnalyticsEventParams & {
  method?: string;
  user_id?: string;
  lead_type?: string;
};

function canTrack() {
  return typeof window !== "undefined" && Boolean(GA_MEASUREMENT_ID);
}

function getAnalyticsWindow(): GoogleAnalyticsWindow | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window as GoogleAnalyticsWindow;
}

export function trackGoogleEvent(
  eventName: string,
  params?: GoogleAnalyticsEventParams
) {
  if (!canTrack()) return;

  const analyticsWindow = getAnalyticsWindow();
  if (!analyticsWindow) return;

  if (typeof analyticsWindow.gtag === "function") {
    if (params && Object.keys(params).length > 0) {
      analyticsWindow.gtag("event", eventName, params);
      return;
    }

    analyticsWindow.gtag("event", eventName);
    return;
  }

  if (params && Object.keys(params).length > 0) {
    sendGAEvent("event", eventName, params);
    return;
  }

  sendGAEvent("event", eventName);
}

export function trackPageView(pagePath: string) {
  if (!canTrack()) return;

  trackGoogleEvent("page_view", {
    page_path: pagePath,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function trackBeginCheckout(params?: GoogleAnalyticsEventParams) {
  trackGoogleEvent("begin_checkout", params);
}

export function trackPurchase(params?: GoogleAnalyticsEventParams) {
  trackGoogleEvent("purchase", params);
}

export function trackUserSignup(params?: AuthAnalyticsEventParams) {
  trackGoogleEvent("user_signup", params);
  trackGoogleEvent("sign_up", params);
}

export function trackLogin(params?: AuthAnalyticsEventParams) {
  trackGoogleEvent("login", params);
}

export function trackUserLogin(params?: AuthAnalyticsEventParams) {
  trackLogin(params);
}

export function trackContactSales(params?: ContactSalesAnalyticsEventParams) {
  const nextParams = {
    lead_type: "contact_sales",
    ...params,
  };

  trackGoogleEvent("contact_sales", nextParams);
  trackGoogleEvent("generate_lead", nextParams);
}

export function trackPaymentInitiated(params?: GoogleAnalyticsEventParams) {
  trackBeginCheckout(params);
  trackGoogleEvent("payment_initiated", params);
}

export function trackPaymentSuccess(params?: GoogleAnalyticsEventParams) {
  trackPurchase(params);
  trackGoogleEvent("payment_success", params);
}
