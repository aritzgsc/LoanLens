/**
 * Intent-based navigation, not eligibility determination or financial advice.
 * Every destination is an existing, reviewed LoanLens page.
 */
export interface GoalPath {
  id: string;
  stage: string;
  choice: string;
  title: string;
  situation: string;
  needed: string;
  takeaway: string;
  limitation: string;
  toolUrl: string;
  toolLabel: string;
  guideUrl: string;
  guideLabel: string;
  first: 'tool' | 'guide';
}
export const goalPaths: GoalPath[] = [
  {
    id:'college',stage:'Before borrowing',choice:'I have offers from two colleges',
    title:'Find the actual annual cost of each school',
    situation:'You have two financial aid letters and want to see which one leaves you with less to pay or borrow.',
    needed:'Annual cost, grants, scholarships and the loans you plan to accept for each school.',
    takeaway:'Two side-by-side net prices, planned borrowing and what remains to fund.',
    limitation:'This does not verify awards or predict costs in later years.',
    toolUrl:'/tools/compare-college-aid-offers/',toolLabel:'Compare my two offers',
    guideUrl:'/guides/compare-college-financial-aid-offers/',guideLabel:'Learn how to read offers',first:'tool',
  },
  {
    id:'payments',stage:'Repaying',choice:'I want to know what I might pay',
    title:'Explore monthly payments and total cost',
    situation:'You want to estimate what repayment could look like and compare the trade-offs across plans.',
    needed:'Your balance, interest rate and loan type. Income and household details help with certain scenarios.',
    takeaway:'Estimated monthly amounts, repayment lengths, total paid and assumptions side by side.',
    limitation:'The estimate is not an official bill, plan approval or eligibility determination.',
    toolUrl:'/calculator/',toolLabel:'Estimate my payments',
    guideUrl:'/guides/compare-student-loan-repayment/',guideLabel:'Learn what to compare',first:'tool',
  },
  {
    id:'interest',stage:'Learning',choice:'I do not understand student loan interest',
    title:'Understand why repayment can cost more than you borrowed',
    situation:'Your statement shows principal, interest or an APR and you want plain-English explanations.',
    needed:'No numbers required to start. A balance and rate are useful if you later try an example.',
    takeaway:'A worked interest example and how to interpret your loan statement.',
    limitation:'Examples use simplified assumptions, not your servicer’s daily account ledger.',
    toolUrl:'/calculator/',toolLabel:'Try an interest scenario',
    guideUrl:'/guides/student-loan-interest-explained/',guideLabel:'Read the interest guide',first:'guide',
  },
  {
    id:'dates',stage:'Repaying',choice:'I received a repayment notice',
    title:'Work out what date and action to check',
    situation:'You received a notice or are concerned about a repayment transition deadline.',
    needed:'The type of notice, the date on it and your current repayment situation.',
    takeaway:'A planning date and questions to check against the real notice.',
    limitation:'Your actual notice and servicer take priority over a calculated date.',
    toolUrl:'/deadlines/',toolLabel:'Check a repayment date',
    guideUrl:'/guides/prepare-for-student-loan-repayment/',guideLabel:'Use the repayment checklist',first:'tool',
  },
  {
    id:'rap',stage:'Repaying',choice:'I want to understand RAP payments',
    title:'Calculate a starting RAP payment by income',
    situation:'You want to estimate a starting RAP payment and explore different income ranges.',
    needed:'Annual adjusted gross income and the number of claimed dependents.',
    takeaway:'An estimated starting monthly payment and a table of sample income brackets.',
    limitation:'This is an illustrative starting payment, not a confirmation of RAP eligibility.',
    toolUrl:'/rap-payment-by-income/',toolLabel:'Calculate RAP payment',
    guideUrl:'/guides/compare-student-loan-repayment/',guideLabel:'Understand payment trade-offs',first:'tool',
  },
  {
    id:'household',stage:'Household',choice:'My spouse and I have different incomes',
    title:'Compare two illustrative household RAP scenarios',
    situation:'You want to see how joint or separate filing inputs might affect one borrower’s modeled RAP payment.',
    needed:'Both annual adjusted gross incomes, eligible loan balances and dependent information.',
    takeaway:'A side-by-side illustration for one borrower using different household assumptions.',
    limitation:'This cannot tell you which tax filing status is best or calculate both spouses’ combined bills.',
    toolUrl:'/tools/married-rap-impact/',toolLabel:'Compare household scenarios',
    guideUrl:'/guides/compare-student-loan-repayment/',guideLabel:'Learn the assumptions',first:'tool',
  },
  {
    id:'pslf',stage:'Forgiveness',choice:'I work in public service and track PSLF',
    title:'Estimate how many qualifying payment periods may remain',
    situation:'You have an official qualifying-payment count and want to visualize a possible milestone.',
    needed:'The certified qualifying-payment count for one loan and a possible next qualifying month.',
    takeaway:'Remaining payments to the 120-payment target and an illustrative milestone date.',
    limitation:'Only official records can confirm qualifying employment, payment counts or forgiveness.',
    toolUrl:'/tools/pslf-payment-tracker/',toolLabel:'Track a PSLF milestone',
    guideUrl:'/guides/pslf-payment-count-checklist/',guideLabel:'Read the PSLF count checklist',first:'tool',
  },
  {
    id:'parent',stage:'Special loans',choice:'I have Parent PLUS loan questions',
    title:'Know what to ask about Parent PLUS consolidation',
    situation:'You need to check how consolidation history and important dates might affect your options.',
    needed:'Your loan type, actual consolidation disbursement date and relevant repayment history.',
    takeaway:'A guided set of checks and next questions to take to your loan servicer.',
    limitation:'This checker does not confirm eligibility or change a loan’s legal status.',
    toolUrl:'/tools/parent-plus-consolidation-checker/',toolLabel:'Check Parent PLUS questions',
    guideUrl:'/guides/prepare-for-student-loan-repayment/',guideLabel:'Review the repayment checklist',first:'tool',
  },
];
