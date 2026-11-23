import type { Inputs, LoanType } from './engine';

// This simulator is intentionally limited to certain Direct-loan portfolios.
// A modeling restriction is not a legal determination of borrower eligibility.
export type ScenarioIssue = {
  kind: 'balance' | 'history' | 'loan-type';
  title: string;
  detail: string;
  link: string;
};
const official = 'https://studentaid.gov/articles/repayment-calculator/';
const eligibility = 'https://studentaid.gov/articles/save/';
const unsupported: Record<LoanType,string|null> = {
  'subsidized':null,'unsubsidized':null,'grad-plus':null,
  'direct-consolidation':null,'subsidized-consolidation':null,
  'ffel':'Some FFEL Stafford loans may qualify for IBR, but this model does not safely simulate FFEL. Perkins loans are a different category.',
  'perkins':'Perkins loans are not directly eligible for IBR. Consolidation may change federal options and payment-count credit.',
  'parent-plus':'Parent PLUS loans have different repayment and consolidation conditions; RAP/IBR cannot simply be assumed.',
  'parent-consolidation':'Consolidation loans that included Parent PLUS debt have special IBR/ICR conditions that this model does not verify.',
  'private':'Private loans do not qualify for federal RAP or IBR. Ask your private lender about repayment choices.'
};
export function scenarioIssue(input: Pick<Inputs,'loans'|'vintage'>):ScenarioIssue|null {
  const active=input.loans.map((loan,index)=>({...loan,index:index+1})).filter(loan=>loan.balance>0);
  if(!active.length) return {kind:'balance',title:'Enter a positive balance',detail:'Add the current balance of at least one loan.',link:official};
  const warnings=active.flatMap(loan=>unsupported[loan.type]?[ `Loan ${loan.index}: ${unsupported[loan.type]}` ]:[]);
  if(warnings.length) return {
    kind:'loan-type',title:'This loan mix needs a plan-by-plan check',
    detail:warnings.join(' ')+' A restricted simulation is not a finding that you have no eligible repayment plans. Verify individual loans before comparing a portfolio.',
    link:eligibility,
  };
  if(input.vintage==='unknown') return {
    kind:'history',title:'Check your federal borrowing history',
    detail:'Which repayment scenarios can be modeled depends on loan disbursement dates and borrowing history. Look up your original loans in StudentAid.gov before selecting a history option. Do not guess to unlock a result.',
    link:official
  };
  return null;
}
