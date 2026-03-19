import PaymentStatePage from "../../components/PaymentStatePage";
import { resolvePaymentSuccessContent } from "../../lib/payment-success";
import { getPayment } from "@/lib/api";

type SearchParams =
  | Promise<{
      reference?: string | string[];
    }>
  | {
      reference?: string | string[];
    };

function getSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PaymentsSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
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
  );
}
