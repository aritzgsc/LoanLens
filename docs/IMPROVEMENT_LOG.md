# LoanLens improvement log

## November 22, 2026

- The private GitHub repository became accessible through its authenticated connector. The starting `main` commit was `bfcb4b6250dd6ab21e972103d22d6cb4aa2c54e1`. The remote tree contained repayment tools and no college aid offer comparison. The Windows runner failed with a CET startup error, so the existing local changes still need to be recovered.
- [Baseline CI run](https://github.com/aritzgsc/LoanLens/actions/runs/44979222186) completed dependency installation, lint, type checks, tests, and the static build. The build emitted 10 HTML pages and warned about 10 unverified rule inputs. The link verification failed because it expected ad slots on the home and calculator even with no ad configuration.
- The release changes verify unique titles and descriptions, canonical URLs, robots directives, sitemap coverage for indexable builds, draft exclusion, and whether a results slot should exist. The production origin still needs to be confirmed in Cloudflare Pages.
- Added a guide to comparing monthly payments and total repayment using [Federal Student Aid](https://studentaid.gov/articles/repayment-calculator/). Previously drafted financial guidance remains subject to its editorial and data checks.
- Published the reviewed privacy and advertising disclosures, hid unfilled publisher details, and suppressed placeholder ads.txt records and AdSense verification tags on noindex pages. The verification tag and valid ads.txt record use the existing authorized configuration. Consulted [Google site management](https://support.google.com/adsense/answer/12131223), [privacy disclosures](https://support.google.com/publisherpolicies/answer/10437794), and [CMP requirements](https://support.google.com/adsense/answer/13554116).
- [First release CI run](https://github.com/aritzgsc/LoanLens/actions/runs/45027815254) confirmed that lint, type checks, tests, the Astro build, and production link checks completed successfully with a reserved `.invalid` test origin. This does not verify a live canonical domain.
- Set up the browser audit in pull request CI. The audit collects screenshots at 390, 768, and 1280 CSS pixels, HTML metrics, and axe findings. Artifact status is recorded on the pull request checks.
- [Release quality CI](https://github.com/aritzgsc/LoanLens/actions/runs/45028302197/job/137226053731) passed 14 Vitest tests, lint, type checks, Astro builds and link checks for 13 production HTML pages and 31 preview HTML pages, and Lighthouse thresholds across five routes. The existing data verifier issued 10 unverified-rule warnings.
- [Chrome and axe audit](https://github.com/aritzgsc/LoanLens/actions/runs/45028533367/artifacts/14756766930) captured 132 screenshots. It found two `scrollable-region-focusable` issues and completed the scripted example and reset checks without harness errors. The table wrappers now expose labeled focus targets for keyboard scrolling.
- Waiting for production evidence before submitting a sitemap or requesting an AdSense review. Search performance, page RPM, ads served, and revenue are unverified.


## Launch integration

- [PR #1](https://github.com/aritzgsc/LoanLens/pull/1) was merged into `main` as `dc0884c1acb77348184f41618d26541931843fec`. Its [final CI](https://github.com/aritzgsc/LoanLens/actions/runs/45028861335) passed and the browser audit produced 132 screenshots with zero serious or critical findings.
- The local offer comparison was still unavailable through the Windows runner. This change implements it against the shared design, adds a guide sourced from Federal Student Aid, and covers integer-cent calculations, misleading inputs, keyboard operation, and reset in CI.

## Vercel migration and homepage

- Reshaped the homepage around choosing a college, estimating payments, and checking repayment deadlines. The embedded estimator and its dedicated page use the shared calculator.
- Grouped tools by when borrowers need them, marked the active navigation, and brought over routing and security headers in Vercel configuration. The legacy SAVE guide path temporarily points at the published deadlines tool while the guide is in editorial review.
- Documented the canonical environment, Google verification and AdSense activation order. No publisher identifiers or ad settings were added.
