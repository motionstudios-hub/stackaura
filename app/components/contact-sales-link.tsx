"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentPropsWithoutRef, MouseEventHandler } from "react";
import { useRef } from "react";
import {
  type ContactSalesAnalyticsEventParams,
  trackContactSales,
} from "../lib/google-analytics";

type ContactSalesLinkProps = Omit<
  ComponentPropsWithoutRef<typeof Link>,
  "href" | "onClick"
> & {
  href?: string;
  method?: string;
  userId?: string | null;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  trackingParams?: Omit<ContactSalesAnalyticsEventParams, "method" | "page" | "user_id">;
};

export default function ContactSalesLink({
  href = "/contact",
  method = "cta_button",
  userId,
  onClick,
  trackingParams,
  ...props
}: ContactSalesLinkProps) {
  const pathname = usePathname();
  const hasTrackedRef = useRef(false);

  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    onClick?.(event);

    if (event.defaultPrevented || hasTrackedRef.current) {
      return;
    }

    hasTrackedRef.current = true;

    trackContactSales({
      method,
      page: pathname || "/",
      user_id: userId ?? undefined,
      ...trackingParams,
    });
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
