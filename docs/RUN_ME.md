# Reproduce the LoanLens audit

The managed Windows runner exits with a CET error before executing PowerShell. The separate Node runner did not initialize. The commands below were prepared for a working local PowerShell session. Use Node 22.12 or later.

## Commands for both revisions

Run the commands in the LoanLens root. For fresh baseline results, use the commit before the improvements in a separate checkout. Apply the audit harness in that checkout or invoke the harness from the improved checkout with the baseline build path.

```powershell
npm ci
npm run lint
npm run typecheck
npm test
npm run verify-data
Remove-Item Env:PUBLISH_DRAFTS -ErrorAction SilentlyContinue
npm run build
npm run check:links
$env:PUBLISH_DRAFTS = 'true'
npm run build
npm run check:links
Remove-Item Env:PUBLISH_DRAFTS -ErrorAction SilentlyContinue
npm exec -- vite-node scripts/simulator-cases.ts
```

Use `npm install` in place of `npm ci` if the checkout has no package lock. Keep the draft build in `dist` for the browser audit. If testing production, rebuild after clearing the environment variable and start a separate preview for that output.

## Browser checks and screenshots

```powershell
npm install --no-save --package-lock=false playwright @axe-core/playwright lighthouse
npm exec -- playwright install chromium
npm run preview -- --host localhost --port 4321
```

Keep the preview running. In another PowerShell session at the project root, set `$loanlensAuditLabel` to `before` or `after`.

```powershell
$loanlensAuditLabel = 'after'
$loanlensAuditDir = Join-Path $env:TEMP ("loanlens-audit-" + $loanlensAuditLabel)
node scripts/audit-browser.mjs http://localhost:4321 $loanlensAuditDir dist
$env:CHROME_PATH = node --input-type=module -e "import {chromium} from 'playwright'; console.log(chromium.executablePath());"
$loanlensPages = (Get-Content (Join-Path $loanlensAuditDir 'browser.json') -Raw | ConvertFrom-Json).urls
foreach ($loanlensPage in $loanlensPages) {
  $loanlensFile = if ($loanlensPage -eq '/') { 'home' } else { $loanlensPage.Trim('/').Replace('/', '--') }
  npm exec -- lighthouse ("http://localhost:4321" + $loanlensPage) --quiet --output=json --output-path=(Join-Path $loanlensAuditDir ($loanlensFile + '-lighthouse.json')) --chrome-flags="--headless"
}
```

Open the fold and full PNGs in both themes at 390, 768 and 1280. Check the home input before making a selection and the example results after the click. Check the mobile nav, empty ad spaces, field labels, chart legends, and every primary CTA. The browser report includes rendered word counts, ad heights, metadata and axe violations. Inspect Lighthouse JSON for LCP under 2,000 ms, CLS under 0.05 and accessibility and SEO scores of at least 0.95. A preview intentionally marked noindex cannot be used to establish production search eligibility.

If the Chromium download is blocked, use an already installed Chromium-based executable with Playwright's `executablePath` option in the audit harness and point Lighthouse's `CHROME_PATH` to the same executable. Record the Chromium version. A missing browser leaves screenshots, axe and Lighthouse unverified.
