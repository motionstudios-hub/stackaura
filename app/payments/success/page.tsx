import GoogleAnalyticsPaymentSuccess from "../../components/google-analytics-payment-success";
import PaymentStatePage from "../../components/PaymentStatePage";
import MetaPixelEvent from "../../components/meta-pixel-event";
import { resolvePaymentSuccessContent } from "../../lib/payment-success";
import { getPayment } from "@/lib/api";

type SearchParams = Promise<{
  reference?: string | string[];
}>;

function getSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PaymentsSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const reference = getSearchValue(resolvedSearchParams.reference) || null;
  let payment = null;

  if (reference) {
    try {
      payment = await getPayment(reference);
    } catch {
      payment = null;
    }
  }

  const content = resolvePaymentSuccessContent(payment);

  return (
    <>
      {payment && reference ? (
        <>
          <GoogleAnalyticsPaymentSuccess
            reference={reference}
            value={payment.amountCents / 100}
            currency={payment.currency || "ZAR"}
          />
          <MetaPixelEvent
            eventName="Purchase"
            params={{
              value: payment.amountCents / 100,
              currency: payment.currency || "ZAR",
              content_name: "Stackaura Payment",
              content_ids: [reference],
              content_type: "product",
              num_items: 1,
            }}
          />
        </>
      ) : null}
      <PaymentStatePage
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
        tone="success"
        detail={content.detail}
        primaryHref={content.primaryHref}
        primaryLabel={content.primaryLabel}
        secondaryHref={content.secondaryHref}
        secondaryLabel={content.secondaryLabel}
        reference={reference}
      />
    </>
  );
}
