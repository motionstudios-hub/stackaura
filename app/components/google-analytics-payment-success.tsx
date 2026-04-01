"use client";

import { useEffect, useRef } from "react";
import { trackPaymentSuccess } from "../lib/google-analytics";

export default function GoogleAnalyticsPaymentSuccess({
  reference,
  value,
  currency,
}: {
  reference: string;
  value: number;
  currency: string;
}) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;

    trackPaymentSuccess({
      transaction_id: reference,
      value,
      currency,
      items: [
        {
          item_id: reference,
          item_name: "Stackaura Payment",
          item_category: "Payment",
          price: value,
          quantity: 1,
        },
      ],
    });
    hasTracked.current = true;
  }, [currency, reference, value]);

  return null;
}
