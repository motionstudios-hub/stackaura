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

export default async function PaymentsSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const reference = getSearchValue(resolvedSearchParams.reference) || null;

  return (
    <PaymentStatePage
      eyebrow="Payment successful"
      title="Ozow payment completed"
      description="Your payment completed successfully. Stackaura will finish the next step in the onboarding or checkout flow from the backend."
      tone="success"
      detail="If the payment was linked to a signup or checkout session, the API should now mark it as paid and continue fulfillment."
      primaryHref="/login"
      primaryLabel="Continue to login"
      secondaryHref="/"
      secondaryLabel="Back to homepage"
      reference={reference}
    />
  );
}
