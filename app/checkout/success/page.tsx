import PaymentStatePage from "../../components/PaymentStatePage";

export default function CheckoutSuccessPage() {
  return (
    <PaymentStatePage
      eyebrow="Payment successful"
      title="Checkout completed successfully"
      description="Your hosted Stackaura checkout payment was processed successfully."
      tone="success"
      detail="You can return to the merchant flow, or contact the Stackaura team if you need help confirming the payment state."
      primaryHref="/"
      primaryLabel="Return to merchant"
      secondaryHref="/contact"
      secondaryLabel="Contact support"
    />
  );
}
