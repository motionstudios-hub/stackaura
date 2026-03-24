export type GatewayCapabilityRow = {
  gateway: string;
  railStatus: string;
  hostedCheckout: string;
  explicitSelection: string;
  autoRouting: string;
  fallback: string;
  statusHandling: string;
  refunds: string;
  note: string;
};

export const gatewayCapabilityMatrix: GatewayCapabilityRow[] = [
  {
    gateway: "Paystack",
    railStatus: "Current rail",
    hostedCheckout: "Supported",
    explicitSelection: "Supported",
    autoRouting: "Supported",
    fallback: "Supported",
    statusHandling: "Webhook + provider verification",
    refunds: "Not yet merchant-facing",
    note: "Card rail in the current Stackaura orchestration layer.",
  },
  {
    gateway: "Yoco",
    railStatus: "Current rail",
    hostedCheckout: "Supported",
    explicitSelection: "Supported",
    autoRouting: "Supported",
    fallback: "Supported",
    statusHandling: "Webhook + provider verification",
    refunds: "Not yet merchant-facing",
    note: "Card rail for hosted checkout and recovery-aware routing.",
  },
  {
    gateway: "Ozow",
    railStatus: "Current rail",
    hostedCheckout: "Supported",
    explicitSelection: "Supported",
    autoRouting: "Supported",
    fallback: "Supported",
    statusHandling: "Webhook + provider verification",
    refunds: "Not yet merchant-facing",
    note: "Bank payment rail with current merchant-facing support in ZAR flows.",
  },
];

export const gatewayCapabilityDisclosures = [
  "Refund APIs are not yet exposed in current merchant-facing Stackaura flows.",
  "Current live merchant-facing rails are Paystack, Yoco, and Ozow.",
  "Additional rails stay outside the public merchant matrix until checkout, status handling, and recovery support are fully ready.",
] as const;
