import PaymentStatePage from "../../components/PaymentStatePage";

type SearchParams = Promise<{
  reference?: string | string[];
}>;

function getSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PaymentsCancelPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const reference = getSearchValue(resolvedSearchParams.reference) || null;

  return (
    <PaymentStatePage
      eyebrow="Payment cancelled"
      title="Payment was cancelled"
      description="The payment session was not completed, so no further action was taken."
      tone="warning"
      detail="You can restart the payment flow whenever you're ready."
      primaryHref="/signup"
      primaryLabel="Try again"
      secondaryHref="/"
      secondaryLabel="Back to homepage"
      reference={reference}
    />
  );
}
