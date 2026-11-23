# LoanLens

An independent, browser-only U.S. student loan repayment calculator and guide site. Astro builds a static site currently hosted on Vercel. Preact handles the interactive tools. The calculation engine has no browser or framework dependency.

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

## Vercel Web Analytics — traffic before monetization

The project includes **`@vercel/analytics@2.0.1`** and mounts its official Astro `<Analytics mode="production" />` component once in `src/layouts/Base.astro`. This covers all public routes without separate page scripts, advertising, Google Analytics, custom events or tracking cookies. It does **not** change Search Console, AdSense or the advertising CMP.

To view traffic, enable Web Analytics in the **`loan-lens` Vercel project** under Analytics/Web Analytics. After publishing a verified `main` deployment, visit `https://myloanlens.vercel.app/` with a browser that does not block analytics, move to `/tools/` and `/guides/`, and look for page-view requests under the Vercel analytics endpoint shown in its dashboard (Vercel v2 may use a unique path instead of `/_vercel/insights/`). Inspect the Vercel dashboard's Visitors, Page Views, Pages and Referrers. No personal borrower values should be included in events.

To measure search discovery separately, use Search Console **Pages** and **Performance → Search results**; sending a sitemap does not by itself mean pages are indexed. See [the monitoring checklist](docs/TRAFFIC_MONITORING.md).

## Configuration

| Variable | Behavior |
| --- | --- |
| PUBLIC_SITE_NAME | Site brand, defaults to LoanLens |
| PUBLIC_SITE_URL | Absolute HTTPS canonical origin. The example host produces a noindex build. |
| PUBLIC_ADSENSE_CLIENT | Public AdSense publisher ID; defaults to ca-pub-8177969374546909, can be overridden by an environment variable. |
| PUBLIC_ADSLOT_RESULTS | Responsive unit under calculator results; defaults to 8951943585. |
| PUBLIC_ADSLOT_ARTICLE | Manual unit after section two on published guides |
| PUBLIC_ADSLOT_SIDEBAR | Manual unit on desktop guide layouts |
| PUBLIC_GOOGLE_CMP_URL | Google-provided standalone Privacy & messaging script URL on fundingchoicesmessages.google.com. Keep unset until CMP contract and behavior are verified. |
| PUBLIC_GOOGLE_SITE_VERIFICATION | Search Console HTML tag token |
| PUBLIC_BING_SITE_VERIFICATION | Bing Webmaster Tools HTML tag token |
| PUBLIC_PARTNER_OFFERS | Defaults to false. Requires an offer URL and reviewed disclosure and privacy pages to enable. |
| PUBLIC_PARTNER_OFFER_URL | Reviewed HTTPS affiliate offer URL |
| STRICT_DATA | Defaults to false. True fails builds with gaps, staleness or unverified rule values. |
| PUBLISH_DRAFTS | Defaults to false. True includes draft articles with noindex and disables crawling for the build. |

## Vercel production

The production project is `loan-lens` in the `aritz-gsc` team. Its canonical hostname is **https://myloanlens.vercel.app** (the team also has the legacy alias `loan--lens.vercel.app`). Build from `main` with the Astro preset, `npm run build`, and output directory `dist`.

- `PUBLIC_SITE_URL=https://myloanlens.vercel.app` is set **for production only**. This is essential: if missing or using `.example`, the site emits `noindex` and blocks crawling.
- `PUBLISH_DRAFTS=false` for production and previews; newly reviewed guides publish normally, and future drafts remain non-indexable until a recorded source check.
- `vercel.json` is the **sole** production source for HTTP headers and legacy redirects. Obsolete non-Vercel `public/_headers` and `public/_redirects` were removed to prevent drift.
- The AdSense public IDs are already in the code. **No ads load unless a valid, verified Google-certified CMP is connected using `PUBLIC_GOOGLE_CMP_URL` and the required consent conditions are met.** The code is not a substitute for approval by AdSense.
- A Vercel deployment showing READY only confirms that a build deployed; it does **not** mean AdSense approved the site. The adult account holder must verify the site in AdSense. Monetization also requires a Vercel plan that permits commercial use or another compliant host.
- About, Contact (public correction reports only), Editorial Policy, Sources and Disclaimer publish under LoanLens without inventing a registered company, expert reviewer or private address. The ten topic guides were source-reviewed and updated on 2026-11-23; a publisher must still check changing law and personal legal obligations. Before commercial advertising, verify legal/privacy requirements for the real publisher. A private contact route is not offered.

### Verification after each production deploy

Check the live canonical, `/robots.txt`, `/ads.txt`, and `/sitemap-index.xml`, and run the GitHub Actions workflow. Review the current AdSense site status and European consent configuration before relying on ads.

For publisher setup, use [the AdSense/SEO checklist](docs/ADSENSE_SEO_VERCEL.md), [source-verification register](docs/FINANCIAL_RULE_REVIEW_2026-11-23.md), [V5 audit status](docs/AUDIT_V5_CLOSURE.md), and [launch checklist](docs/LAUNCH_CHECKLIST.md). Production embeds a read-only `/version.json` SHA. `npm run seo:live` checks public canonicals, redirects, sitemap and the deployed version. Set `EXPECTED_DEPLOY_SHA` for an exact release check. Google Search Console must be verified by the property owner using the already-supported `PUBLIC_GOOGLE_SITE_VERIFICATION` token.
