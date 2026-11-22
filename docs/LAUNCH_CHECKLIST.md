# LoanLens launch checklist

The GitHub repository is currently public. Never commit secrets, individual loan data or personal details. Use a compatible Node version (CI uses 22). Build with `npm run build` and publish `dist`. Use `PUBLISH_DRAFTS=false` for production and all public previews.

## Do these in order

1. **Connect the repository and set the site origin.** Use the existing `aritzgsc/LoanLens` GitHub-linked project `loan-lens` in team `aritz-gsc` with the Astro preset. Build `main` using `npm run build`, publish `dist`, and set `PUBLIC_SITE_URL` for Production to the final HTTPS domain. Set `PUBLISH_DRAFTS=false` on production and public preview, redeploy after production environment changes, and check canonical, sitemap, robots.txt, ads.txt, and legacy redirects. As of 2026-11-22, the canonical production domain is `myloanlens.vercel.app`; `loan--lens.vercel.app` is a secondary alias.
2. **Check publisher information.** Publisher and contact blocks are hidden while their values are placeholders. Verify the generated pages show only confirmed details.
3. **Review and approve content.** Follow [REVIEW_PACKET.md](REVIEW_PACKET.md). Compare real matching scenarios using [SIMULATOR_CASES.md](SIMULATOR_CASES.md). Run `npm run review:approve -- <slug>` to print the checks, then repeat with `--yes` after completing them. For launch, enable `STRICT_PUBLISH=true` and run the production verification in [RUN_ME.md](RUN_ME.md). Check that the about, contact, privacy and other approved pages are live.
4. **Create the Search Console property.** Verify domain ownership, submit the production sitemap and inspect representative pages for indexability.
5. **Apply for AdSense through an eligible account holder.** Verify the Vercel subscription allows commercial advertising (Hobby does not). If the operator is under 18, an adult parent/guardian must hold and manage AdSense using their own Google account. In AdSense, add the final domain, choose meta tag verification, and verify the built-in public publisher ID is `ca-pub-8177969374546909`, with the manual results slot `8951943585`. Redeploy, verify, and request review. Wait for the site to be Ready and configure the consent integration before enabling units. Leave Auto ads off. Set up at most three manual placements per page, with fewer on short pages. Put none between inputs and results or next to primary action buttons.
6. **Configure and verify the CMP.** Use the consent configuration provided for your account. Test acceptance, refusal, revocation, Global Privacy Control and consent not available in the affected regions. Verify that eligible ads load lazily after consent and interaction, and that no calculator data is sent to the ad provider.
7. **Configure ads.txt.** The site generates `google.com, pub-8177969374546909, DIRECT, f08c47fec0942fa0` for indexable builds. Confirm the actual production `/ads.txt` response and compare with AdSense. Verify a configured live unit on narrow and wide screens before enabling monetization.

## Production acceptance

- [ ] Lint, type check, tests, data checks, both builds and internal links pass.
- [ ] Every route passes mobile and desktop accessibility checks; performance measurements meet the audit thresholds.
- [ ] Unverified assumptions are listed and remain visible wherever they apply.
- [ ] Verify Vercel's `vercel.json` headers and report-only CSP in the live deployment before considering enforcement.
- [ ] Confirm the private preview and any draft content are inaccessible to the public.

## Known non-code dependencies (do not mark complete prematurely)

- The AdSense site must be approved (`Ready`) independently of Vercel build status.
- The production URL is set in Vercel; verify public `robots.txt`, `ads.txt` and canonical after redeploy.
- The real Google-certified CMP URL is not configured. The existing consent-gated ad loader deliberately shows no advertising until consent can be validated. Configure and test before enabling ads.
- About, Contact (public issues only), Editorial Policy, Sources and Disclaimer have been reviewed and published with project-level transparency, not a fictitious company or personal identity. Legal/private contact requirements for monetization remain an external review item; other guides and legal pages may still be drafts.
- Commercial hosting entitlements and the AdSense account holder's eligibility cannot be inferred from a successful deployment.
