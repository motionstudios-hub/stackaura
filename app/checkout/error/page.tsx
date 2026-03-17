import PaymentStatePage from "../../components/PaymentStatePage";

export default function CheckoutErrorPage() {
  return (
    <PaymentStatePage
      eyebrow="Payment error"
      title="Checkout could not be completed"
      description="Something interrupted the hosted checkout flow before the payment could be processed."
      tone="error"
      detail="You can retry the payment from the merchant flow or contact Stackaura support if the problem continues."
      primaryHref="/"
      primaryLabel="Return to merchant"
      secondaryHref="/contact"
      secondaryLabel="Contact support"
    />
  );
}
