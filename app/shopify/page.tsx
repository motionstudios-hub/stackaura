import type { Metadata } from "next";
import ShopifyEmbeddedShell from "./shopify-embedded-shell";

export async function generateMetadata(): Promise<Metadata> {
  const apiKey = process.env.SHOPIFY_API_KEY?.trim() ?? "";

  return {
    title: "Shopify Merchant Console",
    other: apiKey
      ? {
          "shopify-api-key": apiKey,
        }
      : {},
  };
}

export default async function ShopifyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const apiKey = process.env.SHOPIFY_API_KEY?.trim() ?? "";
  const resolvedSearchParams = await searchParams;
  const initialShop = typeof resolvedSearchParams.shop === "string" ? resolvedSearchParams.shop : "";
  const initialHost = typeof resolvedSearchParams.host === "string" ? resolvedSearchParams.host : "";

  console.info("[ShopifyPage] incoming search params", {
    shop: initialShop || null,
    host: initialHost || null,
    allSearchParams: resolvedSearchParams,
  });

  return (
    <>
      <ShopifyEmbeddedShell
        apiKey={apiKey}
        initialShop={initialShop}
        initialHost={initialHost}
        view="home"
      />
    </>
  );
}
