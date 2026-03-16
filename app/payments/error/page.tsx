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
      title="Ozow payment could not be completed"
      description="Something interrupted the payment flow before Stackaura could finish the checkout or onboarding path."
      tone="error"
      detail="You can retry from signup or checkout once the payment service is available again."
      primaryHref="/signup"
      primaryLabel="Return to signup"
      secondaryHref="/"
      secondaryLabel="Back to homepage"
      reference={reference}
    />
  );
}
