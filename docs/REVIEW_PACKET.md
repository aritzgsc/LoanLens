# Editorial review packet

These checklists remain for **future** edits and publisher verification. Ten new topic guides were independently source-checked for their stated educational claims on 2026-11-23 and now have `status: reviewed`. That **does not** mean a named lawyer, CPA or official reviewer certified them. Reopen any page as `draft` if a rule changes or its cited evidence is not valid. The project deliberately has no invented personal author, mailbox or professional credentials.

```powershell
npm run review:list
npm run review:approve -- <slug>
npm run review:approve -- <slug> --yes
```

Use `all` only after reviewing every remaining page. Where a link points to a later draft page, check the private preview with drafts enabled and recheck the production link after approving both pages.

## `about`

- [ ] Verify the claims below against primary sources or deployed behavior.
- [ ] Verify that author and contact placeholders are filled where shown.
- [ ] Check rendered links, headings and any worked example.

Calculator scope and actual publisher identity. Confirm the name and bio in src/lib/site.ts.


## `accessibility`

- [ ] Verify the claims below against primary sources or deployed behavior.
- [ ] Verify that author and contact placeholders are filled where shown.
- [ ] Check rendered links, headings and any worked example.

Chart data tables and contact channel. Confirm both in the deployed site.


## `advertising`

- [ ] Verify the claims below against primary sources or deployed behavior.
- [ ] Verify that author and contact placeholders are filled where shown.
- [ ] Check rendered links, headings and any worked example.

Possible paid placements and consent controls. Check AdSlot.astro, PartnerOffers.astro and public/ads-consent.js in the deployed configuration.


## `contact`

- [ ] Verify the claims below against primary sources or deployed behavior.
- [ ] Verify that author and contact placeholders are filled where shown.
- [ ] Check rendered links, headings and any worked example.

Contact address and reporting channels. Verify the address in src/lib/site.ts and test mailbox delivery.


## `disclaimer`

- [ ] Verify the claims below against primary sources or deployed behavior.
- [ ] Verify that author and contact placeholders are filled where shown.
- [ ] Check rendered links, headings and any worked example.

Comparison limits, actual eligibility and payment verification. Cross-check against engine inputs and unverified src/data/rules.json entries.


## `editorial-policy`

- [ ] Verify the claims below against primary sources or deployed behavior.
- [ ] Verify that author and contact placeholders are filled where shown.
- [ ] Check rendered links, headings and any worked example.

Use of primary sources and flagged modeling assumptions. Confirm against the current site and src/data/rules.json.


## `faq`

- [ ] Verify the claims below against primary sources or deployed behavior.
- [ ] Verify that author and contact placeholders are filled where shown.
- [ ] Check rendered links, headings and any worked example.

Plan and filing eligibility, credit requirements, notice windows, fixed tiers and discharge amounts.
Data references in `src/data/rules.json` include `newLoanDate`, `saveNoticeDays`, `saveFinalNoticeDays`, `rapJoint`, `rapDependent`, `pslfMonths`, `parentIcrPayments`, `taxIdr`, `taxPslf`, `tierTerms`.

## `glossary`

- [ ] Verify the claims below against primary sources or deployed behavior.
- [ ] Verify that author and contact placeholders are filled where shown.
- [ ] Check rendered links, headings and any worked example.

Definitions used by the calculator and federal repayment programs.
Data references in `src/data/rules.json` include `rapBands`, `ibrNew`, `pslfMonths`, `tierTerms`, `consolidationTerms`, `poverty`, `rapWaiver`, `ibrCapitalization`.

## `idr-forgiveness-taxes`

- [ ] Verify the claims below against primary sources or deployed behavior.
- [ ] Verify that author and contact placeholders are filled where shown.
- [ ] Check rendered links, headings and any worked example.

General federal treatment of IDR and PSLF, discharge timing, and separate state and exception checks.
Data references in `src/data/rules.json` include `taxIdr`, `taxPslf`, `pslfMonths`, `rapMonths`.

## `married-filing-rap`

- [ ] Verify the claims below against primary sources or deployed behavior.
- [ ] Verify that author and contact placeholders are filled where shown.
- [ ] Check rendered links, headings and any worked example.

Joint and separate tax incomes and dependent counts, eligible spouse allocation, payment floor and fixed spouse forecast.
Data references in `src/data/rules.json` include `rapJoint`, `rapDependent`, `rapMinimum`, `spouseBalanceForecast`.

## `parent-plus-consolidation`

- [ ] Verify the claims below against primary sources or deployed behavior.
- [ ] Verify that author and contact placeholders are filled where shown.
- [ ] Check rendered links, headings and any worked example.

Historical consolidation cutoff, required payment, post-cutoff borrowing and operational servicing timing.
Data references in `src/data/rules.json` include `parentConsolidationBefore`, `parentIcrPayments`, `parentOperationalCutoff`, `sunsetDate`, `newLoanDate`, `tierTerms`.

## `privacy`

- [ ] Verify the claims below against primary sources or deployed behavior.
- [ ] Verify that author and contact placeholders are filled where shown.
- [ ] Check rendered links, headings and any worked example.

Browser calculation, shareable scenario payload, hosting and optional CMP/advertising. Review against Calculator.tsx, Base.astro, public/ads-consent.js and actual deployment.


## `rap-and-pslf`

- [ ] Verify the claims below against primary sources or deployed behavior.
- [ ] Verify that author and contact placeholders are filled where shown.
- [ ] Check rendered links, headings and any worked example.

RAP is an eligible plan subject to qualifying loans, employment and payments. Monthly threshold, remaining balance and account-specific buyback.
Data references in `src/data/rules.json` include `pslfMonths`, `rapMonths`, `newLoanDate`, `priorPlanCredit`, `saveHistory`.

## `rap-payment-calculation`

- [ ] Verify the claims below against primary sources or deployed behavior.
- [ ] Verify that author and contact placeholders are filled where shown.
- [ ] Check rendered links, headings and any worked example.

Full-AGI bands, dependent reduction, minimum payment, spouse allocation, waiver and matching principal.
Data references in `src/data/rules.json` include `rapBands`, `rapLowIncomeAnnual`, `rapMinimum`, `rapDependent`, `rapJoint`, `rapWaiver`, `rapPrincipalLimit`, `rapMonths`.

## `rap-vs-ibr`

- [ ] Verify the claims below against primary sources or deployed behavior.
- [ ] Verify that author and contact placeholders are filled where shown.
- [ ] Check rendered links, headings and any worked example.

Loan-vintage eligibility, poverty allowance and family definition, lower bounds, plan benefits and confirmed plan credit.
Data references in `src/data/rules.json` include `rapBands`, `rapDependent`, `rapMinimum`, `rapMonths`, `rapWaiver`, `rapPrincipalLimit`, `ibrPovertyMultiplier`, `ibrOld`, `ibrNew`, `ibrLowPayments`, `newLoanDate`, `priorPlanCredit`.

## `refinance-federal-loans`

- [ ] Verify the claims below against primary sources or deployed behavior.
- [ ] Verify that author and contact placeholders are filled where shown.
- [ ] Check rendered links, headings and any worked example.

Loss of federal plan and forgiveness options on privately refinanced balances. Federal exit counseling documents benefits; a lender’s offer controls private terms.
Data references in `src/data/rules.json` include `rapWaiver`, `rapPrincipalLimit`, `rapMonths`, `ibrNew`, `pslfMonths`, `fixedSchedule`.

## `save-ended-what-now`

- [ ] Verify the claims below against primary sources or deployed behavior.
- [ ] Verify that author and contact placeholders are filled where shown.
- [ ] Check rendered links, headings and any worked example.

First and final notice windows, fixed-plan reassignment, separate PAYE/ICR transition and case-specific credit.
Data references in `src/data/rules.json` include `saveNoticeDays`, `saveFinalNoticeDays`, `newLoanDate`, `sunsetDate`, `saveHistory`.

## `sources`

- [ ] Verify the claims below against primary sources or deployed behavior.
- [ ] Verify that author and contact placeholders are filled where shown.
- [ ] Check rendered links, headings and any worked example.

Federal rule, agency and tax references. Cross-check destination URLs against src/data/rules.json.


## `terms`

- [ ] Verify the claims below against primary sources or deployed behavior.
- [ ] Verify that author and contact placeholders are filled where shown.
- [ ] Check rendered links, headings and any worked example.

Educational site purpose and third-party links. Confirm against deployed behavior.


## `tiered-standard`

- [ ] Verify the claims below against primary sources or deployed behavior.
- [ ] Verify that author and contact placeholders are filled where shown.
- [ ] Check rendered links, headings and any worked example.

Debt at repayment entry, bracket boundaries, fixed minimum, consolidation terms and limits of the remaining schedule estimate.
Data references in `src/data/rules.json` include `tierTerms`, `fixedMinimum`, `fixedSchedule`, `standardMonths`, `consolidationTerms`, `newLoanDate`.
