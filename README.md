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
- `PUBLISH_DRAFTS=false` for production and previews; unpublished financial guidance and trust pages must not be exposed.
- `vercel.json` is the source of Vercel HTTP headers and legacy redirects. The Cloudflare-only files in `public/_headers` and `public/_redirects` are not authoritative on Vercel.
- The AdSense public IDs are already in the code. **No ads load unless a valid, verified Google-certified CMP is connected using `PUBLIC_GOOGLE_CMP_URL` and the required consent conditions are met.** The code is not a substitute for approval by AdSense.
- A Vercel deployment showing READY only confirms that a build deployed; it does **not** mean AdSense approved the site. The adult account holder must verify the site in AdSense. Monetization also requires a Vercel plan that permits commercial use or another compliant host.
- The About, Contact, Editorial policy, Terms, Sources and other draft pages require genuine editorial review before they can go live. Never fill missing author/contact details with invented values.

### Verification after each production deploy

Check the live canonical, `/robots.txt`, `/ads.txt`, and `/sitemap-index.xml`, and run the GitHub Actions workflow. Review the current AdSense site status and European consent configuration before relying on ads.

For the account-holder setup and checklist, see [the Spanish AdSense and SEO guide](docs/ADSENSE_SEO_VERCEL.md) and [the launch checklist](docs/LAUNCH_CHECKLIST.md).
