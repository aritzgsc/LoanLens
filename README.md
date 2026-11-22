# LoanLens

An independent, browser-only U.S. student loan repayment calculator and guide site. Astro generates static files for Cloudflare Pages. Preact handles the interactive tools. The calculation engine has no browser or framework dependency.

## Local development

Use Node 22.12 or newer. Commands below use PowerShell.

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

```powershell
npm run lint
npm run typecheck
npm test
npm run verify-data
npm run review:list
npm run build
npm run check:links
npx lhci autorun
```

To check draft rendering locally:

```powershell
$env:PUBLISH_DRAFTS = 'true'
npm run build
npm run check:links
Remove-Item Env:PUBLISH_DRAFTS
```

Use `npm run preview` to serve the last static build. Check HTML in `dist` with `npm run check:links`; the script verifies one H1, unique titles, canonicals, JSON-LD, reserved results slots, local assets and draft publication rules.

## Configuration

| Variable | Behavior |
| --- | --- |
| PUBLIC_SITE_NAME | Site brand, defaults to LoanLens |
| PUBLIC_SITE_URL | Absolute HTTPS canonical origin. The example host produces a noindex build. |
| PUBLIC_ADSENSE_CLIENT | AdSense account identifier in its ca-pub form. Placeholder produces an inactive integration. |
| PUBLIC_ADSLOT_RESULTS | Manual unit after calculator results |
| PUBLIC_ADSLOT_ARTICLE | Manual unit after section two on published guides |
| PUBLIC_ADSLOT_SIDEBAR | Manual unit on desktop guide layouts |
| PUBLIC_GOOGLE_CMP_URL | Google-provided standalone Privacy & messaging script URL on fundingchoicesmessages.google.com. Keep unset until CMP contract and behavior are verified. |
| PUBLIC_GOOGLE_SITE_VERIFICATION | Search Console HTML tag token |
| PUBLIC_BING_SITE_VERIFICATION | Bing Webmaster Tools HTML tag token |
| PUBLIC_PARTNER_OFFERS | Defaults to false. Requires an offer URL and reviewed disclosure and privacy pages to enable. |
| PUBLIC_PARTNER_OFFER_URL | Reviewed HTTPS affiliate offer URL |
| STRICT_DATA | Defaults to false. True fails builds with gaps, staleness or unverified rule values. |
| PUBLISH_DRAFTS | Defaults to false. True includes draft articles with noindex and disables crawling for the build. |

## Cloudflare Pages

Connect the GitHub repository to a Cloudflare Pages project. Select the production branch, choose Astro, set the build command to `npm run build`, and set the output directory to `dist`. Use Node 22 and point the root at this directory. No Pages functions or database bindings are needed.

Add your real domain in Pages under Custom domains. Set `PUBLIC_SITE_URL` to the HTTPS canonical origin and deploy again. Give preview environments `PUBLISH_DRAFTS=true` and put an access policy on previews containing review material. Confirm that production has `PUBLISH_DRAFTS=false`. Enable Cloudflare Web Analytics on the Pages project after the privacy copy is reviewed. Redirect alternate hostnames to your chosen domain after it works over HTTPS.

See [launch steps](docs/LAUNCH_CHECKLIST.md), [primary sources](docs/DATA_SOURCES.md), [projection assumptions](docs/ASSUMPTIONS.md) and [validation](docs/VALIDATION.md).
