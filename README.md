This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Shopify embedded merchant console MVP

This repo now serves the embedded Shopify merchant console at:

- `/shopify`
- `/shopify/settings`

It uses App Bridge session tokens in the browser, then calls same-origin Next API
routes which forward to the Nest checkout API Shopify module.

Frontend env:

```bash
CHECKOUT_API_URL=http://127.0.0.1:3001
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_APP_URL=https://your-public-tunnel-url
SHOPIFY_WEBHOOK_PATH=/api/shopify/webhooks
```

Local development:

```bash
# terminal 1
cd ../checkout-api
npm install
npm run start:dev:3001

# terminal 2
cd .
npm install
npm run dev

# terminal 3
npm run shopify:tunnel
```

Shopify app values:

- App URL: `https://<your-tunnel>`
- Redirect URL: `https://<your-tunnel>/api/shopify/auth/callback`
- Webhook target: `https://<your-tunnel>/api/shopify/webhooks`

Helpful local guardrails:

- `npm run dev` now binds the Next frontend to `127.0.0.1:3000`
- `npm run shopify:tunnel` always targets `http://127.0.0.1:3000`
- `npm run shopify:check` verifies the frontend listener, the backend health endpoint, and flags any `cloudflared` process still using `http://localhost:3000`

Current supported scopes:

- `read_products`
- `read_orders`

Current registered webhook topic:

- `app/uninstalled`

Shopify theme app extension deployment:

- Root Shopify CLI files now exist:
  - `shopify.app.toml`
  - `shopify.web.toml`
- Theme app extension path:
  - `extensions/stackaura-support-agent`
- Helpful commands:
  - `npm run shopify:config:link`
  - `npm run shopify:dev`
  - `npm run shopify:deploy`
  - `npm run shopify:release`
- Merchant activation flow after deploy:
  1. Open the Shopify theme editor.
  2. Enable the `Stackaura Support Agent` app embed block.
  3. Paste the Stackaura app origin into the `Stackaura app URL` setting.
  4. Save the theme.

Intentionally deferred:

- protected customer data topics such as `orders/create`
- checkout interception
- payment gateway routing
- checkout extensions

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
