# Stackaura Support Agent Theme App Extension

This is the Shopify theme app extension for the Stackaura storefront support widget.

Current state:
- Theme app extension lives inside the Shopify app project structure
- App embed block handle: `stackaura-support-agent-embed`
- App embed setting required: `Stackaura app URL`
- The live storefront widget shell and basic conversation runtime are ready in code
- Shopify CLI project files now exist at the repo root:
  - `shopify.app.toml`
  - `shopify.web.toml`

Deployment path:
1. Link this repo to the real Shopify app:
   - `npm run shopify:config:link`
2. Run the app locally through Shopify CLI:
   - `npm run shopify:dev`
3. Deploy the extension and app configuration:
   - `npm run shopify:deploy`
4. In the Shopify theme editor, activate the Stackaura Support Agent app embed block and paste the Stackaura app origin into the `Stackaura app URL` setting.
5. The storefront shell fetches `/shopify/support-agent/widget-config?shop=<shop-domain>` from that app origin and renders the live widget shell.
6. Customer messages post to `/shopify/support-agent/chat` on that same app origin and receive the first Stackaura support response runtime.
7. Richer live AI handling comes next.
