# Data sources

Values are maintained in `src/data/rules.json`. Dates below identify the source rule or schedule. Dates marked operational in the notes may vary for individual borrowers.

| Parameter | Value | Effective | Retrieved | Status and primary source |
| --- | --- | --- | --- | --- |
| rapBands | `[[10000,0],[20000,0.01],[30000,0.02],[40000,0.03],[50000,0.04],[60000,0.05],[70000,0.06],[80000,0.07],[90000,0.08],[100000,0.09],[null,0.1]]` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| rapMinimum | `10` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| rapDependent | `50` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| rapPrincipalLimit | `50` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| rapMonths | `360` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| rapWaiver | `true` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| rapJoint | `"Joint AGI, eligible debt proration, then payment floor. Separate based on borrower income and claimed dependents."` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| rapTypes | `["subsidized","unsubsidized","grad-plus","direct-consolidation","subsidized-consolidation"]` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| tierTerms | `[[25000,120],[50000,180],[100000,240],[null,300]]` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| standardMonths | `120` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| fixedMinimum | `50` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| consolidationTerms | `[[7500,120],[10000,144],[20000,180],[40000,240],[60000,300],[null,360]]` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| consolidationTermsStart | `"2006-07-01"` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| newLoanDate | `"2026-07-01"` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/PLAW-119publ21/pdf/PLAW-119publ21.pdf) |
| ibrNewDate | `"2014-07-01"` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| ibrOld | `{"rate":0.15,"months":300}` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| ibrNew | `{"rate":0.1,"months":240}` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| ibrPovertyMultiplier | `1.5` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| ibrInterestSubsidyMonths | `36` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| ibrCap | `"10-year Standard amount determined when entering IBR; confirm existing cap with servicer."` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| ibrLowPayments | Below $5 → $0. From $5 to below $10 → $10. | 2026-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| rapLowIncomeAnnual | $120 for AGI of $10,000 or below. | 2026-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| payeIcrFallback | Eligible loans default to RAP, otherwise IBR under transition rules. | 2028-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| parentPaymentWindow | At least one eligible payment during July 4, 2025–June 30, 2028 for the regulatory exception. | 2026-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| ibrRounding | `null` | 2026-07-01 | 2026-11-22 | [UNVERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| poverty | `{"contiguous":{"first":15960,"increment":5680},"AK":{"first":19950,"increment":7100},"HI":{"first":18360,"increment":6530}}` | 2026-01-13 | 2026-11-22 | [VERIFIED](https://aspe.hhs.gov/poverty-guidelines/) |
| pslfMonths | `120` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://studentaid.gov/sites/default/files/public-service-application-for-forgiveness.pdf) |
| pslfPlans | `["rap","ibr","standard-120","paye-until-sunset","icr-until-sunset"]` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://studentaid.gov/sites/default/files/public-service-application-for-forgiveness.pdf) |
| pslfTiered | `false` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://studentaid.gov/sites/default/files/public-service-application-for-forgiveness.pdf) |
| saveNoticeDays | `90` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://studentaid.gov/articles/save/) |
| saveFinalNoticeDays | `30` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://studentaid.gov/articles/save/) |
| sunsetDate | `"2028-07-01"` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://www.govinfo.gov/content/pkg/PLAW-119publ21/pdf/PLAW-119publ21.pdf) |
| parentConsolidationBefore | `"2026-07-01"` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://studentaid.gov/understand-aid/types/loans/plus/parent) |
| parentIcrPayments | `1` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://studentaid.gov/understand-aid/types/loans/plus/parent) |
| parentOperationalCutoff | `null` | 2026-07-01 | 2026-11-22 | [UNVERIFIED](https://studentaid.gov/understand-aid/types/loans/plus/parent) |
| interestRates | `{"undergraduate":0.0652,"graduate":0.0807,"plus":0.0907}` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://fsapartners.ed.gov/fsa-print/publication/1007224) |
| ratesEndExclusive | `"2027-07-01"` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://fsapartners.ed.gov/fsa-print/publication/1007224) |
| taxIdr | `"Generally cancellation-of-debt income from 2026; exceptions may apply."` | 2026-01-01 | 2026-11-22 | [VERIFIED](https://www.taxpayeradvocate.irs.gov/news/tax-tips/what-to-know-about-student-loan-forgiveness-and-your-taxes/2026/03/) |
| taxPslf | `"Generally excluded from federal income under the service-based exception."` | 2026-01-01 | 2026-11-22 | [VERIFIED](https://www.irs.gov/publications/p4681) |
| interestConvention | `"Daily simple interest; the monthly projection uses the FSA annual rate divided by months example."` | 2026-07-01 | 2026-11-22 | [VERIFIED](https://studentaid.gov/articles/subsidized-vs-unsubsidized-loans/) |
| multiLoanAllocation | `null` | 2026-07-01 | 2026-11-22 | [UNVERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| spouseBalanceForecast | `null` | 2026-07-01 | 2026-11-22 | [UNVERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| futurePoverty | `null` | 2027-01-01 | 2026-11-22 | [UNVERIFIED](https://aspe.hhs.gov/poverty-guidelines/) |
| payoffReentry | `null` | 2026-07-01 | 2026-11-22 | [UNVERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| ibrCapitalization | `null` | 2026-07-01 | 2026-11-22 | [UNVERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| priorPlanCredit | `null` | 2026-07-01 | 2026-11-22 | [UNVERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| fixedSchedule | `null` | 2026-07-01 | 2026-11-22 | [UNVERIFIED](https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08556.htm) |
| saveHistory | `null` | 2026-07-01 | 2026-11-22 | [UNVERIFIED](https://studentaid.gov/articles/save/) |

- **ibrRounding**. Servicer installment rounding and sub-dollar treatment across loan groups have not been independently reconciled. Projection uses cent precision.
- **poverty**. 2026 schedule; future schedules are unknown.
- **parentOperationalCutoff**. Check the last operational enrollment date and first ICR payment deadline with the servicer.
- **multiLoanAllocation**. Monthly allocation and RAP principal-match distribution are approximated in multi-loan projections.
- **spouseBalanceForecast**. Future eligible spouse balances are unknown; held flat unless the borrowing scenario is edited.
- **futurePoverty**. Future poverty guidelines are unknown and held flat.
- **payoffReentry**. Borrowers with paid-off prior balances or plan-switch histories should confirm their IBR new-borrower classification and repayment terms.
- **ibrCapitalization**. Timing and amount of account-level capitalization when reaching the IBR cap or changing plans require servicing history.
- **priorPlanCredit**. Prior IDR credit is assumed to be the confirmed credit for the destination plan. Verify transfer, timing and loan-specific counts.
- **fixedSchedule**. Fixed estimates use a fresh schedule. Confirm any existing fixed-plan term, remaining installments, and balance at repayment entry.
- **saveHistory**. Individual forbearance credit and buyback eligibility require account records.

The enacted text is [Public Law 119-21](https://www.govinfo.gov/content/pkg/PLAW-119publ21/pdf/PLAW-119publ21.pdf). Final regulations include detailed eligibility and transition provisions in 34 CFR 685.208–685.210. The finalized REPAYE regulatory text and the practical SAVE wind-down must be read alongside [current FSA borrower instructions](https://studentaid.gov/articles/save/).
