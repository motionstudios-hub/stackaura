import PaymentStatePage from "../../components/PaymentStatePage";

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

export default async function PaymentsErrorPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const reference = getSearchValue(resolvedSearchParams.reference) || null;

  return (
    <PaymentStatePage
      eyebrow="Payment error"
      title="Payment could not be completed"
      description="Something interrupted the payment flow before checkout could finish."
      tone="error"
      detail="Please try again in a moment or contact support if the issue continues."
      primaryHref="/signup"
      primaryLabel="Try again"
      secondaryHref="/"
      secondaryLabel="Back to homepage"
      reference={reference}
    />
  );
}
