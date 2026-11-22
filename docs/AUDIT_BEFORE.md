# LoanLens baseline audit

Date: 2026-11-22

The table records the project review supplied with the task. The local command runner in this session exited with `Your Windows doesn't fully support CET` before executing the baseline commands. The results in the table have not been reproduced in this session.

| Check | Review baseline |
| --- | --- |
| Dependencies, ESLint, production build, link check | Passed |
| Vitest | 12 tests passed |
| Type check | No result supplied |
| Data verification | 10 parameters marked UNVERIFIED |
| Production build | 10 pages |
| Build with `PUBLISH_DRAFTS=true` | 31 pages |
| Main content in 12 guides | 1,095–1,241 words per guide |
| FAQ and glossary | 1,241 and 1,212 words respectively |
| Home and calculator | About 290 words per page |
| Trust pages | 70–250 words per page |
| Preview screenshots | Review supplied observations at 390×844 and 1280×800 |
| Lighthouse, axe and official Loan Simulator comparison | No measurements supplied |

The review reported empty 250px ad spaces and an unused desktop sidebar, a home hero that pushed the first mobile input below the fold, dollar amounts without consistent cents, heavy assumption notices, confusing payment charts and unequal related cards. Its draft-build count includes content that was absent from production.

The fresh audit still needs the three-width screenshots, individual word counts, Lighthouse and axe runs, and inspection of the captured images. See [RUN_ME.md](RUN_ME.md) for the command-line steps.
