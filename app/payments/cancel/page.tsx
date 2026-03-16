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

export default async function PaymentsCancelPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const reference = getSearchValue(resolvedSearchParams.reference) || null;

  return (
    <PaymentStatePage
      eyebrow="Payment cancelled"
      title="Ozow checkout was cancelled"
      description="The payment session was not completed, so Stackaura did not continue the paid flow."
      tone="warning"
      detail="No further action was taken from this frontend. You can restart the payment flow from signup or from a hosted checkout link."
      primaryHref="/signup"
      primaryLabel="Try signup again"
      secondaryHref="/"
      secondaryLabel="Back to homepage"
      reference={reference}
    />
  );
}
