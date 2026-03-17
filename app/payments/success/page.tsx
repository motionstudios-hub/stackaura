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
      title="Merchant account activated"
      description="Your Ozow payment completed successfully, and your Stackaura merchant workspace is now active."
      tone="success"
      detail="You can continue to login and access your dashboard, API keys, and payment tools."
      primaryHref="/login"
      primaryLabel="Continue to login"
      secondaryHref="/"
      secondaryLabel="Back to homepage"
      reference={reference}
    />
  );
}
