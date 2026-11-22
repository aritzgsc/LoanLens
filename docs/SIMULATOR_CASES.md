# Loan Simulator comparison

Use the public Federal Student Aid [Loan Simulator](https://studentaid.gov/loan-simulator/) with the same inputs when it exposes them. Record a mismatch in allowed plans or unsupported inputs in the notes rather than substituting a number.

The table uses the engine's baseline borrower: a Direct Unsubsidized loan of $30,000 at 6%, starting adjusted gross income of $45,000, single, no dependents, contiguous U.S., newer IBR borrower, no prior credits, and flat income for these cases. The generator uses the start month in the engine fixture. Capture the exact start month alongside each official run.

| Case | Change from the baseline | LoanLens engine output | Official Loan Simulator result |
| --- | --- | --- | --- |
| RAP and new Direct Loan | Borrowing history is new Direct | Pending engine run | |
| Legacy IBR | Older IBR borrower | Pending engine run | |
| Tiered Standard | New Direct, debt at first tier threshold on entry | Pending engine run | |
| Joint return | Spouse AGI $30,000, eligible spouse debt $18,000, one claimed dependent | Pending engine run | |
| Separate return | Same spouse figures, borrower claims one dependent | Pending engine run | |
| Dependents | AGI $50,000, two claimed dependents | Pending engine run | |
| Alaska | AGI $50,000, one dependent, Alaska | Pending engine run | |
| Hawaii | AGI $50,000, one dependent, Hawaii | Pending engine run | |
| PSLF boundary | Qualifying employment and one certified payment below the threshold | Pending engine run | |
| Partly repaid Standard | Older IBR borrower, original debt $30,000, current balance $18,000 at 6% | Pending engine run | |

Run `npm exec -- vite-node scripts/simulator-cases.ts` after installation. It prints each eligible plan, first bill, total paid, forgiveness and duration, with an empty column for the official result. For the partly repaid loan, also record the actual months remaining. A fresh LoanLens term is not an account schedule.
