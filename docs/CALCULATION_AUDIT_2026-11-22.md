# LoanLens — Calculation and eligibility audit (22 November 2026)

> **Scope:** Review of the formulas and safeguards implemented by LoanLens against the U.S. Department of Education's current public explanations and the site's own documented modeling assumptions. This is an engineering audit, not government certification, servicing reconciliation or legal advice. Some rules still require account-specific decisions.

## Executive findings

- **RAP:** Income bands apply a percentage to *full* adjusted gross income (AGI), divided by 12; income up to $10,000 uses the $10/month minimum; claimed dependents reduce the payment by $50 each, with a $10 floor. An existing regression test matches the Department of Education's $150 monthly payment / $40 interest waiver / $50 principal-match example. Additional tests check the exact band boundaries. See [FSA RAP/IDR FAQs](https://studentaid.gov/articles/faqs-idr-plan/) and [Department of Education fact sheet](https://www.ed.gov/about/news/press-release/fact-sheet-trump-administration-simplifying-student-loan-repayment).
- **IBR:** The engine applies 10% or 15% of income after subtracting 150% of a selected HHS poverty guideline, then an estimated 10-year Standard cap. This is conditional on the user's *self-reported* borrowing category, tax filing and family information. It does **not** establish eligibility or a servicer's actual preexisting cap. See [FSA repayment plans](https://studentaid.gov/manage-loans/repayment/plans).
- **Standard and Tiered Standard:** A fixed monthly amount uses the ordinary amortizing-loan equation; regression tests check a $30,000 loan at 6% APR over 120 months. Tiered Standard uses the initial-debt input and currently documented 10/15/20/25-year bands. Final payments can be smaller than the ordinary monthly bill. See [FSA Standard Repayment Plan](https://studentaid.gov/manage-loans/repayment/plans/standard) and [Federal Student Aid repayment overview](https://studentaid.gov/manage-loans/repayment/plans).
- **PSLF:** The site estimates a target date from the *certified count provided by the user* and a 120-payment goal, assuming future months count. It cannot verify qualifying employment, individual loan counts, consolidation history or eligibility. See [FSA PSLF](https://studentaid.gov/manage-loans/forgiveness-cancellation/public-service).
- **College aid:** `net price = annual cost of attendance - grants - scholarships`, with a zero floor. Planned loans are tracked *separately*, not treated as discounts. Values are parsed and computed in integer cents. The checker now rejects inconsistent totals (gift aid above the stated annual cost or planned loans exceeding the remaining net price) and tells the user to verify the offer. See [FSA evaluating aid offers](https://studentaid.gov/articles/evaluating-financial-aid-offers/) and [financial aid dictionary](https://studentaid.gov/articles/financial-aid-dictionary/).

## Independent numerical checks

| Scenario | Expected arithmetic | What tests verify |
| --- | --- | --- |
| RAP, AGI $45,000, no dependents | $45,000 × 4% / 12 = $150/month | RAP starting payment and published example |
| RAP, AGI $45,000, one claimed dependent | $150 - $50 = $100/month | $50 reduction with $10 minimum |
| RAP, AGI $100,000 | $100,000 × 9% / 12 = $750/month | Bracket's inclusive upper threshold |
| RAP, AGI $100,001 | $100,001 × 10% / 12 ≈ $833.34/month | Next band applies to full AGI |
| Fixed, $30,000, 6% APR, 10 years | Approx. $333.06 monthly before final adjustment | Independent amortization formula and paid ≈ principal + interest |
| College A: $30,000 cost, $7,000 grants, $5,000 scholarships, $5,500 planned loans | $18,000 net price; $12,500 remaining after loans | Cent-exact comparison with separate debt |
| College B: $36,000 cost, $8,000 grants, $11,000 scholarships, $4,000 planned loans | $17,000 net price; $13,000 remaining after loans | Lower net price despite higher advertised cost |

These illustrative figures are not individually quoted federal bills. A passing test means the **implemented formula** matches the expected mathematical output for that example, not that its forecast matches a borrower's account statement.

## Known modeling limitations (do not hide)

1. The model accrues **monthly** interest from APR/12, whereas actual federal interest generally accrues **daily**. Exact daily costs, timing, rounding, fees, preexisting accrued interest, late payments and capitalization can differ.
2. Forecasts assume on-time monthly payments, constant household circumstances and a user-selected income-growth rate. Future HHS poverty schedules, pay changes, filing status and account recertification can differ.
3. The site does not securely connect to a federal loan account or fetch official plan qualification results. The available-plan list is based on **the category selected by the user**, not verified disbursement records. Parent PLUS, FFEL and private-loan cases are intentionally referred to official guidance when the input cannot support a confident numerical comparison.
4. **Consolidation, prior IBR/RAP credit, PSLF payment histories, spouse balance projections and allocation between multiple loans** can require account-specific assumptions. The engine flags several of these in the result. A debt-based projection should never be promoted as confirmed forgiveness.
5. Future forgiveness amounts are not reduced for possible tax effects; the "lowest modeled total paid" comparison excludes such effects. [IRS Publication 4681](https://www.irs.gov/publications/p4681) discusses cancellation of debt.
6. Rules, including eligibility windows, may change. The effective and retrieval dates are recorded in [rules.json](../src/data/rules.json). `VERIFIED` means a source value was checked, not independently implemented and confirmed by a loan servicer.
7. A campus aid offer may contain conditions, annual renewals, work-study, parent borrowing and expenses outside standard assumptions. The aid comparator only compares the four explicitly stated annual inputs.

## Release safeguards

- Unit tests: `npm test` cover repayment thresholds, subsidy examples, amortization, PSLF boundaries, exact aid cents, inconsistent award totals and nonnegative forecast values.
- `npm run verify-data` validates the source inventory and data freshness checks.
- `npm run build` and `npm run check:links` guard static pages and metadata.
- Browser audit checks desktop/mobile in both operating-system color-scheme settings; it now explicitly checks action-button text contrast at WCAG AA 4.5:1 and runs an automated accessibility scan.

## Editorial rule before monetization

The **official agency/servicer remains the authority** for eligibility and repayments. Do not claim all calculations are exact, all borrowers are eligible or Google has reviewed the site. Keep uncertain scenarios and source limitations visible, and review current rules before publishing changes to forecasts.

Sources: [Federal Student Aid repayment plans](https://studentaid.gov/manage-loans/repayment/plans), [FSA IDR FAQ](https://studentaid.gov/articles/faqs-idr-plan/), [FSA aid offers](https://studentaid.gov/articles/evaluating-financial-aid-offers/), [ASPE 2026 poverty guidelines](https://aspe.hhs.gov/poverty-guidelines/), [DOE RAP examples](https://www.ed.gov/about/news/press-release/fact-sheet-trump-administration-simplifying-student-loan-repayment).
