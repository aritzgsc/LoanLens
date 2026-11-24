# LoanLens — SEO, indexation and production healthcheck

**Canonical public URL:** https://myloanlens.vercel.app/ (with **loan**, not **load**).

This project is a free, independent, English-language planning site about U.S. student loan repayment and college financial aid. The priority is helping people solve real questions—not generating dozens of thin keyword pages or claiming government affiliation.

## 1. Configuration that must be correct before Google can index us

- Vercel project: `loan-lens` on team `aritz-gsc`, production branch `main`.
- Production environment variable `PUBLIC_SITE_URL=https://myloanlens.vercel.app` (no trailing slash).
- `PUBLISH_DRAFTS=false` for production. Drafts are not public and should not appear in the sitemap.
- The public production hostname must serve ordinary, unprotected HTTP 200 pages to unauthenticated crawlers.
- Production must serve `/robots.txt` containing `Allow: /` and the `https://myloanlens.vercel.app/sitemap-index.xml` declaration.
- Pages must use their own canonical URL on that domain, and must **not** emit `noindex` in HTML or `X-Robots-Tag` headers.
- Vercel preview/old deployment URLs can correctly be `noindex`; do **not** use them as canonical URLs or submit them to Search Console.

The existing code generates canonical tags, Open Graph metadata, JSON-LD, a robots file, and sitemap pages. The CI build now explicitly tests the **real canonical hostname**, not a test-only domain. Publishing a new build is required before environment changes or code changes reach production.

**After deployment** run the dedicated live check:

```bash
npm run seo:live
```

Or visit **GitHub → Actions → Check public LoanLens indexability → Run workflow**, on `main`. This is read-only and tests HTTP status, headers, robots, canonicals, title/description and sitemap inclusion against the actual public hostname. If it fails, fix the reason before submitting any pages.

## 2. Google Search Console (action needed from the site owner)

No one can promise indexing or ranking. **Search Console** is how you see Google's real status for *your* property.

1. Go to [Google Search Console](https://search.google.com/search-console/).
2. Add a **URL-prefix property**: `https://myloanlens.vercel.app/` (include HTTPS, use the exact domain).
3. Verify ownership. The site already supports an HTML meta verification token using the production variable `PUBLIC_GOOGLE_SITE_VERIFICATION`. If Google provides a `<meta name="google-site-verification" content="TOKEN">` tag, set the **token value only**, rebuild production, then click Verify in Search Console. Alternatively use Google's HTML-file verification after adding Google's exact file under `public/` and deploying.
4. Open **Sitemaps** and submit `sitemap-index.xml`. Wait for Google to fetch it.
5. Open **URL Inspection**, paste `https://myloanlens.vercel.app/`, and check **Page indexing**, **Crawled page**, **User-declared canonical**, **Google-selected canonical**, and the live test.
6. If the live test shows an indexable page, use **Request indexing**. Repeat selectively for `/tools/`, `/guides/`, `/calculator/` and one important guide. It is not necessary to submit every URL manually when your sitemap works.
7. Open **Pages → Not indexed** to find specific reasons and fix those before requesting another crawl.

A `site:myloanlens.vercel.app` search can give a rough clue but is not proof of Google's index state. A sitemap is a discovery aid, not a ranking shortcut.

## 3. Content and internal-link strategy

| Search intent | Best landing page | Why |
| --- | --- | --- |
| How much could my student loan payment be? | `/calculator/` | Interactive repayment comparison with assumptions |
| Which college aid offer is cheaper? | `/tools/compare-college-aid-offers/` | Annual net price, borrowing, remaining funding gap |
| What is student loan interest? | `/guides/student-loan-interest-explained/` | Worked example and official source links |
| What do grants and loans in an aid letter mean? | `/guides/understand-college-aid-types/` | Separates grant/scholarship/work-study/loans |
| How should I prepare for repayment? | `/guides/prepare-for-student-loan-repayment/` | Checklist and official-account next steps |
| Common LoanLens questions | `/guides/faq/` | Explains actual site behavior and directs to relevant tools |

Each page needs a specific intent, unique headings, useful examples and links to the relevant calculator or guide. Do not create multiple nearly identical keyword pages, fake testimonials, invented author credentials or promises about approval. Especially for financial topics, source currency and honest limitations matter.

## SEO V2: search intent and measurement

Keep existing URLs and canonicals. Home targets the planning toolkit, `/calculator/` the full federal repayment comparison, `/rap-payment-by-income/` the quick RAP monthly payment and bracket table, `/guides/rap-payment-calculation/` the formula, and `/guides/rap-vs-ibr/` the plan comparison explanation. Do not create duplicate calculator landing pages solely for keywords. The RAP calculator uses the existing `rapPayment` engine, with no formula changes, and assumes no eligible spouse debt; joint filing scenarios remain in the married RAP tool.

In Search Console, filter Web search to United States. Track non-brand queries such as `RAP payment calculator`, `RAP payment by income`, `RAP vs IBR`, `SAVE plan ended`, `PSLF payment tracker`, and `compare college financial aid offers`. These are hypotheses, not measured search volumes. Compare impressions, clicks, CTR and average position by query and landing page over comparable 28-day periods once data is available. Check whether home and `/calculator/` overlap before making further structural changes. Avoid promising rankings or repeatedly requesting indexing.

References: [Google Search Essentials](https://developers.google.com/search/docs/essentials), [title links](https://developers.google.com/search/docs/appearance/title-link), [helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [Federal Student Aid IDR FAQs](https://studentaid.gov/articles/faqs-idr-plan/).

## 4. What we can and cannot measure

**Code-level pass** means the build generated valid HTML and links, sitemap, robots, headings and metadata.

**Live-HTTP pass** means the deployed hostname appears crawlable and has the intended metadata; it does not reveal Google's actual index or rankings.

**Search Console** is the authoritative place to diagnose why a URL is excluded, see impressions/queries/clicks and follow up. New websites may remain undiscovered or unindexed for some time even with correct technical SEO. Building useful content and earning legitimate mentions elsewhere can improve discovery over time, but there is no guaranteed timeframe or ranking.

## 5. Official guidance

- [Get started with Google Search Console](https://developers.google.com/search/docs/monitor-debug/search-console-start/)
- [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Ask Google to recrawl URLs](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
- [Google canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

Last revised: 2026-11-22.
