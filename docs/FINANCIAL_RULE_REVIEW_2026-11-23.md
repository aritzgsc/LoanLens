# LoanLens — financial sources and unresolved model constraints
**Source-check date:** 2026-11-23 (UTC). **Scope:** public educational claims, not individual eligibility or professional legal certification.

## Current source checks

| Rule family | Primary reference | Confirmed public statement / model boundary |
|---|---|---|
| RAP & IBR eligibility | https://studentaid.gov/articles/save/ | Eligible types and disbursement date differ; Direct Parent PLUS is excluded from RAP, FFEL Stafford can be eligible for IBR, Perkins is separate, some consolidations require extra conditions |
| Income calculation | https://studentaid.gov/articles/faqs-idr-plan/ | RAP full-AGI rates 1–10%, $50 dependent reduction, $10 minimum; IBR 10%/15% of discretionary income with applicable cap |
| Married repayment | https://studentaid.gov/articles/marriage-student-loans/ | Joint vs separate income and relative eligible debt can alter one borrower's payment |
| SAVE transition | https://studentaid.gov/articles/save/ | 90-day period begins when notice is **received from servicer**, followed by separate final 30-day notice; fixed-plan reassignment depends on loan dates |
| PSLF/RAP | https://studentaid.gov/manage-loans/forgiveness-cancellation/public-service | 120 eligible payments and employment; new RAP rules require on-time, full payments for relevant loans; do not equate a forecast with a discharge |
| Parent PLUS ICR-to-IBR | https://studentaid.gov/articles/save/ and https://studentaid.gov/understand-aid/types/loans/plus/parent | Consolidation before July 2026 and the recorded ICR payment can affect a limited pathway; no universal guaranteed outcome |
| Tiered Standard | https://studentaid.gov/articles/save/ | Term bands 10/15/20/25 years at published debt thresholds, subject to loan date and balance at entry |
| IDR taxes | https://www.taxpayeradvocate.irs.gov/news/tax-tips/what-to-know-about-student-loan-forgiveness-and-your-taxes/2026/03/ | Post-2025 IDR forgiveness generally taxable federally, with exceptions; PSLF generally excluded; state and future rules not simulated |
| Federal loan refinancing | https://studentaid.gov/articles/financial-aid-dictionary/ | Refinancing with a private lender exits the federal-loan system for those balances and can remove federal benefits |

## Ten explicitly UNVERIFIED modeling constraints (not automatically solvable)

These values remain `null`/UNVERIFIED in `src/data/rules.json`. Never change their status solely to eliminate source warnings. Verification would require account-level information, future rules or servicing evidence.

| Key | Reason not declared a fully verified personal input | Safe product handling |
|---|---|---|
| `ibrRounding` | Servicer-specific rounding and sub-dollar installment allocation | Illustrative cent precision only, detailed assumption |
| `parentOperationalCutoff` | Actual enrollment/first ICR payment date depends on administrator processing | Parent checklist warns conditionally; seek notice/servicer |
| `multiLoanAllocation` | Loan-group allocation and principal-match split are approximated | Result warning for multiple loans, no account quote |
| `spouseBalanceForecast` | Future eligible spouse debt is unknown | Flat spouse-balance projection; scenario warning |
| `futurePoverty` | Poverty guidelines beyond 2026 are not yet established | Reuse known guideline with year disclaimer |
| `payoffReentry` | Earlier paid-off loans and IBR classification require actual history | Historical scenario warning and FSA referral |
| `ibrCapitalization` | Interest capitalization depends on repayment events and accrued balance | IBR warning, not a definitive capitalization schedule |
| `priorPlanCredit` | Qualifying IDR/PSLF month counts are loan- and program-specific | Require confirmed borrower input, warn when prior months entered |
| `fixedSchedule` | Fresh model schedule may differ from remaining actual installment term | Mark fixed projection as new schedule |
| `saveHistory` | SAVE forbearance credits/buyback depend on account-specific events | Do not count months automatically; deadline helper links to FSA |

## Editorial scope
Ten educational topic guides were checked against the linked primary sources and published as reviewed **2026-11-23**. The review did **not** certify legal eligibility, every loan rule, the user's financial situation, or personal taxes. It did not invent a professional author or support mailbox. All source dates, evidence limitations and numerical scenarios should be checked again when official rules change.

## Change management
A correction to a formula requires: (1) cited primary legal paragraph or current FSA policy, (2) dated evidence entry, (3) before/after numerical case and corresponding unit test, (4) passing typecheck/build/links/Lighthouse and seven-width Chrome tests, and (5) verifying deployed commit SHA.
