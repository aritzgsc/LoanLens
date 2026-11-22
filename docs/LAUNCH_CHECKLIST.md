# LoanLens launch checklist

Keep the GitHub repository private. Use Node 22.12 or later in CI and Cloudflare Pages. Use `npm run build` and publish `dist`. Keep `PUBLISH_DRAFTS=true` on private preview builds only.

## Do these in order

1. **Set the domain.** Attach the real HTTPS domain to Cloudflare Pages and set `PUBLIC_SITE_URL` to that origin. The example host forces noindex. Check canonical URLs, `robots.txt` and alternate-host redirects.
2. **Check publisher information.** Publisher and contact blocks are hidden while their values are placeholders. Verify the generated pages show only confirmed details.
3. **Review and approve content.** Follow [REVIEW_PACKET.md](REVIEW_PACKET.md). Compare real matching scenarios using [SIMULATOR_CASES.md](SIMULATOR_CASES.md). Run `npm run review:approve -- <slug>` to print the checks, then repeat with `--yes` after completing them. For launch, enable `STRICT_PUBLISH=true` and run the production verification in [RUN_ME.md](RUN_ME.md). Check that the about, contact, privacy and other approved pages are live.
4. **Create the Search Console property.** Verify domain ownership, submit the production sitemap and inspect representative pages for indexability.
5. **Apply for AdSense.** Submit the real domain using your actual publisher account. Leave Auto ads off. Set up at most three manual placements per page, with fewer on short pages. Put none between inputs and results or next to primary action buttons.
6. **Configure and verify the CMP.** Use the consent configuration provided for your account. Test acceptance, refusal, revocation, Global Privacy Control and consent not available in the affected regions. Verify that eligible ads load lazily after consent and interaction, and that no calculator data is sent to the ad provider.
7. **Configure ads.txt.** Use the record from your AdSense account and confirm the production `/ads.txt` response. Verify a configured live unit on narrow and wide screens before enabling monetization.

## Production acceptance

- [ ] Lint, type check, tests, data checks, both builds and internal links pass.
- [ ] Every route passes mobile and desktop accessibility checks; performance measurements meet the audit thresholds.
- [ ] Unverified assumptions are listed and remain visible wherever they apply.
- [ ] Verify the actual Cloudflare privacy configuration and report-only CSP before enforcement.
- [ ] Confirm the private preview and any draft content are inaccessible to the public.
