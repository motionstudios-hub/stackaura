import PaymentStatePage from "../../components/PaymentStatePage";

export default function CheckoutCancelPage() {
  return (
    <PaymentStatePage
      eyebrow="Payment cancelled"
      title="Checkout was cancelled"
      description="The hosted checkout session was interrupted before the payment could complete."
      tone="warning"
      detail="No additional action was taken on this page. You can return to the merchant flow and start the checkout again when you’re ready."
      primaryHref="/"
      primaryLabel="Return to merchant"
      secondaryHref="/contact"
      secondaryLabel="Contact support"
    />
  );
}
