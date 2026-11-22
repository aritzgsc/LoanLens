# Launch checklist

## Repository and review

- [ ] Install under Node 22 and commit the resulting npm lockfile. Use the same version in CI and Pages.
- [ ] Run lint, typecheck, tests, metadata validation, production and draft builds, the generated HTML link check and Lighthouse CI.
- [ ] Run matched public Loan Simulator examples and record the comparison in VALIDATION.md. Review the calculator scenarios, keyboard, screen readers, mobile layout, dark mode and print.
- [ ] Replace author name, author bio and contact email throughout the project.
- [ ] Review each parameter against its cited source, update effective and retrieval dates, and resolve entries marked UNVERIFIED.
- [ ] Review every draft article and trust page, including privacy, advertising and legal language. Add the date in the reviewed field and set status to reviewed. Use npm run review:list to check remaining drafts.
- [ ] Turn on STRICT_DATA after blocking records are resolved. For unknowable forecasts, decide during review whether to explicitly exclude the forecast from published output or to carve out a separate assumptions category with reviewed scenario behavior.

## Cloudflare and discovery

- [ ] Connect the repository to Cloudflare Pages. Set Node 22, build command npm run build, output directory dist, and the production branch.
- [ ] Add the canonical custom domain, configure redirects for alternate hosts, and set PUBLIC_SITE_URL to the real HTTPS origin.
- [ ] Configure PUBLISH_DRAFTS=true only in private preview environments. Production must omit drafts.
- [ ] Verify Search Console and Bing via DNS or the configured HTML tag tokens. Submit sitemap-index.xml, then inspect sample routes and robots.txt from production.
- [ ] Enable cookieless Cloudflare Web Analytics from the Pages dashboard. Verify it does not receive scenario fragments. Check field INP when enough data becomes available.
- [ ] Check the CSP report-only console on production. Inventory the observed sources, replace broad wildcard hosts with specific allowed hosts where viable, and test without inline execution before moving any directive into an enforced policy. Keep strict-origin-when-cross-origin for Google messaging.

## Google AdSense

- [ ] Publish the reviewed About, Contact, Privacy, Terms, Disclaimer, Accessibility, Editorial Policy, Sources and Advertising Disclosure pages.
- [ ] In AdSense Sites, add the real origin and use the Google AdSense account meta tag as the verification method. Set PUBLIC_ADSENSE_CLIENT and check both the rendered tag and /ads.txt against your account. Request review.
- [ ] In Ads, turn off Auto ads and remove any automatic placements. Create three fixed display ad units for 300 × 250 creatives and use their IDs for results, article and sidebar. Check placement in rendered HTML on both mobile and desktop.
- [ ] In Privacy & messaging, configure European regulations, select the sites and publish the Google CMP message. Enable consent mode for advertising purposes in the European settings. Configure US state regulations separately, select the sites, choose all supported current and future states for targeting, review partners, and publish. Expose the privacy choices link and verify sale, sharing and targeted advertising opt-outs.
- [ ] Obtain a supported CMP bootstrap independent of the ad request script for your exact AdSense account configuration. If Google supplies a standalone Funding Choices URL, configure PUBLIC_GOOGLE_CMP_URL. Google’s AdSense US message documentation ordinarily calls for the AdSense code to be present. Verify that the separate bootstrap produces the correct consent signals before enabling any manual units. Keep monetization disabled if the account does not support this ordering.
- [ ] With the account configured, verify TCF opt-in, refusal, revocation, US opt-out, GPC, no CMP response, and the first-interaction and visibility requirements in real browser network traces. Verify manual requests, the appropriate privacy signal, and that no calculator fields or fragments appear in third-party traffic. Document the combinations and outcomes.
- [ ] Leave partner offers off unless the offer and disclosures are reviewed. Confirm the refinancing disclosure and sponsored link treatment before enabling.

References: [US state message setup](https://support.google.com/adsense/answer/10960771), [AdSense consent mode](https://support.google.com/adsense/answer/16053245), [Consent Mode v2](https://developers.google.com/tag-platform/security/guides/consent), [ads.txt](https://support.google.com/adsense/answer/12171612) and [site verification](https://support.google.com/adsense/answer/13996652).
