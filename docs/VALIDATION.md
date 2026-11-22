# Validation

The tests cover zero and high income, the RAP floor and bracket edges, dependents, filing status, regional guidelines, unpaid interest, final installments, PSLF boundaries and fixed term thresholds. The $27,000 at 6% example uses Federal Student Aid’s published $135 monthly interest estimate. The Department of Education’s [RAP example](https://www.ed.gov/about/news/press-release/fact-sheet-trump-administration-simplifying-student-loan-repayment) checks the $150 bill and $50 principal reduction on $35,000 of debt at $45,000 AGI.

[Loan Simulator](https://studentaid.gov/loan-simulator/) numerical parity has not been measured. Account-linked inputs, such as loan-specific histories, can produce different results. This implementation uses simple monthly interest and approximate multi-loan payment distribution, assumes annual income recertification, holds poverty schedules and eligible spouse balances flat, and accepts previously credited IDR or PSLF months as scenario inputs without validating them. It estimates a new fixed schedule from the current balance even when the original term has partly elapsed. It does not model existing capitalization events, processing-month gaps, tax liability, or certain loan-specific exceptions.

Before marking the calculator reviewed, run matched cases in both tools for each plan including joint debt, Parent PLUS exceptions and partially repaid Standard loans. Record the public simulator build date, shared inputs, results, and differences. The browser calculator is a planning model, and the servicer determines actual eligibility and payment amounts.

The task runner did not start PowerShell because its bundled executable hit a Windows CET compatibility error. The Node execution surface also failed initialization. No npm, built HTML, Lighthouse, browser or Git command has been verified in this session.

Lighthouse CI tests lab LCP, CLS and total blocking time. INP requires real interaction measurements. Check the deployed site with a browser interaction trace and monitor field INP after enough traffic is available.
