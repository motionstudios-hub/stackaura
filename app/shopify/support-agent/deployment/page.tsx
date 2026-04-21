import type { Metadata } from "next";
import ShopifyEmbeddedShell from "../../shopify-embedded-shell";

export async function generateMetadata(): Promise<Metadata> {
  const apiKey = process.env.SHOPIFY_API_KEY?.trim() ?? "";

  return {
    title: "Shopify Support Agent Deployment",
    other: apiKey
      ? {
          "shopify-api-key": apiKey,
        }
      : {},
  };
}

export default async function ShopifySupportAgentDeploymentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const apiKey = process.env.SHOPIFY_API_KEY?.trim() ?? "";
  const resolvedSearchParams = await searchParams;
  const initialShop = typeof resolvedSearchParams.shop === "string" ? resolvedSearchParams.shop : "";
  const initialHost = typeof resolvedSearchParams.host === "string" ? resolvedSearchParams.host : "";

  console.info("[ShopifySupportAgentDeploymentPage] incoming search params", {
    shop: initialShop || null,
    host: initialHost || null,
    allSearchParams: resolvedSearchParams,
  });

  return (
    <ShopifyEmbeddedShell
      apiKey={apiKey}
      initialShop={initialShop}
      initialHost={initialHost}
      view="settings"
    />
  );
}
