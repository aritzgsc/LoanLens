# Assumptions

- LoanLens is the configurable independent brand. The reserved example host is a local-build default. Published metadata requires the real host.
- The calculator uses browser-local inputs and URL fragments for explicit sharing. Shared links contain the entered financial scenario and should only be shared deliberately.
- Dates are month-level estimates. Repayment begins in the chosen month with uninterrupted qualifying payments. Month counts are user-entered and can vary by loan. PSLF and IDR counts are distinct.
- The forecast uses simple monthly interest and end-of-month payments. Existing unpaid interest, program fees, capitalization events, changed filing status, changing family size, precise recertification timing, and existing plan-switch terms require servicing records.
- Annual growth affects borrower and spouse AGI in the same proportion. Future poverty guidelines and future spouse balances are held flat and explicitly flagged when used.
- Show supported numerical comparisons for clean Direct Loan portfolios. Parent PLUS, FFEL, uncertain or mixed eligibility, and consolidated legacy history route to authoritative checks when the data entered cannot support a responsible estimate.
- Total cost means undiscounted out-of-pocket scheduled payments before any tax on forgiveness. Badges compare eligible modeled results and ties may share badges.
- Ad requests require CMP consent, first interaction, and an in-view manual placement. Strict consent uses a fail-closed signal and Global Privacy Control. Ads remain disabled without publisher and unit IDs.
- Editorial articles and trust pages start in draft. Preview builds show drafts with noindex and disallow crawling. Core tool and utility pages are independently indexed on a configured production host.
- Supporting articles use build-time examples from editable scenarios. No author or organizational credentials are inferred.
- A valid incoming anonymous scenario fragment is removed after browser restoration. The separate CMP does not bootstrap on an incoming scenario link. Validate dashboard-injected analytics separately for fragment and data avoidance before enabling it.
- Cloudflare Web Analytics uses dashboard-managed injection after deployment. Website hosting remains under the user's Cloudflare account.
