import rules from '../../data/rules.json';

export { rules };
export type Region = keyof typeof rules.poverty.value;
export type Filing = 'single' | 'joint' | 'separate';
export type LoanType = 'subsidized' | 'unsubsidized' | 'grad-plus' | 'direct-consolidation' | 'subsidized-consolidation' | 'parent-plus' | 'parent-consolidation' | 'ffel' | 'private';
export type Plan = 'rap' | 'ibr' | 'standard' | 'tiered';
export interface Loan { balance: number; rate: number; type: LoanType; }
export interface Inputs {
  loans: Loan[];
  income: number;
  spouseIncome: number;
  spouseBalance: number;
  filing: Filing;
  growth: number;
  dependents: number;
  otherFamily: number;
  region: Region;
  vintage: 'old' | 'new-ibr' | 'new-direct' | 'unknown';
  initialDebt: number;
  ibrCap: number;
  ibrSubsidyUsed: number;
  ibrMonthsAlready: number;
  rapMonthsAlready: number;
  pslf: boolean;
  certified: number;
  start: string;
}
export interface Point { month: number; balance: number; payment: number; }
export interface Result {
  plan: Plan;
  title: string;
  starting: number;
  paid: number;
  interest: number;
  forgiven: number;
  pslfDate: string | null;
  pslfSavings: number | null;
  months: number;
  end: string;
  outcome: 'paid' | 'idr' | 'pslf';
  points: Point[];
  flags: (keyof typeof rules)[];
  badges: string[];
}

export const annualMonths = 12;
export const example: Inputs = {
  loans: [{balance: 30000, rate: .06, type:'unsubsidized'}], income: 45000,
  spouseIncome: 0, spouseBalance: 0, filing: 'single', growth: .02,
  dependents: 0, otherFamily: 0, region: 'contiguous', vintage: 'new-ibr',
  initialDebt: 0, ibrCap: 0, ibrSubsidyUsed: 0, ibrMonthsAlready: 0,
  rapMonthsAlready: 0, pslf: false, certified: 0, start: rules.newLoanDate.value.slice(0, 7)
};

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
export const money = (amount: number) => new Intl.NumberFormat('en-US', {
  style:'currency', currency:'USD', maximumFractionDigits:2, minimumFractionDigits:0
}).format(amount);
export const dateAfter = (start: string, offset: number) => {
  const [year, month] = start.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1 + offset)).toISOString().slice(0, 7);
};
export const dateLabel = (month: string) => new Intl.DateTimeFormat('en-US', {
  month:'short', year:'numeric', timeZone:'UTC'
}).format(new Date(month + '-01T00:00:00Z'));
const cents = (amount: number) => Math.round(amount * 100) / 100;
const prorate = (balance: number, spouse: number) => spouse > 0 ? balance / (balance + spouse) : 1;
export const paymentAtRate = (balance: number, rate: number, months: number) => {
  const monthly = rate / annualMonths;
  return monthly === 0 ? balance / months : balance * monthly / -Math.expm1(-months * Math.log1p(monthly));
};
export function rapPayment(agi: number, dependents: number, balance = 0, spouseBalance = 0) {
  const band = rules.rapBands.value.find(([limit]) => limit === null || agi <= limit);
  const annual = band?.[1] === 0 ? rules.rapLowIncomeAnnual.value : agi * (band?.[1] ?? 0);
  const raw = annual / annualMonths - dependents * rules.rapDependent.value;
  return cents(Math.max(rules.rapMinimum.value, raw * prorate(balance, spouseBalance)));
}
export function poverty(region: Region, familySize: number) {
  const row = rules.poverty.value[region];
  return row.first + (familySize - 1) * row.increment;
}
export function ibrPayment(input: Inputs, agi: number, balance: number, cap: number) {
  const familySize = 1 + Number(input.filing === 'joint') + input.dependents + input.otherFamily;
  const gap = Math.max(0, agi - rules.ibrPovertyMultiplier.value * poverty(input.region, familySize));
  const { rate } = input.vintage === 'old' ? rules.ibrOld.value : rules.ibrNew.value;
  const payment = Math.min(cap, gap * rate / annualMonths * prorate(balance, input.filing === 'joint' ? input.spouseBalance : 0));
  const { zeroBelow, minimumPositive } = rules.ibrLowPayments.value;
  return payment < zeroBelow ? 0 : cents(Math.max(minimumPositive, payment));
}
export function termAt(debt: number, terms: (number|null)[][]) {
  return terms.find(([limit]) => limit === null || debt < limit)?.[1] ?? rules.standardMonths.value;
}
export function remainingPslf(certified: number) {
  return Math.max(0, rules.pslfMonths.value - certified);
}

function eligible(input: Inputs): Plan[] {
  if (input.vintage === 'unknown' || input.loans.some(loan => !rules.rapTypes.value.includes(loan.type))) return [];
  if (input.vintage === 'new-direct') return ['rap', 'tiered'];
  return ['rap', 'ibr', 'standard'];
}

function simulate(input: Inputs, plan: Plan, allowPslf: boolean): Result {
  const accounts = input.loans.map(loan => ({...loan, principal:loan.balance, accrued:0}));
  const principal = () => sum(accounts.map(loan => loan.principal));
  const debt = () => principal() + sum(accounts.map(loan => loan.accrued));
  const opening = debt();
  const tierDebt = input.initialDebt || opening;
  const fixedTerm = plan === 'tiered' ? termAt(tierDebt, rules.tierTerms.value)
    : plan === 'standard' && accounts.some(loan => loan.type.endsWith('consolidation'))
      ? termAt(tierDebt, rules.consolidationTerms.value) : rules.standardMonths.value;
  const fixed = (months: number) => Math.max(rules.fixedMinimum.value, cents(sum(accounts.map(loan =>
    paymentAtRate(loan.balance, loan.rate, months)))));
  const fixedPayment = fixed(fixedTerm);
  const ibrCap = input.ibrCap || fixed(rules.standardMonths.value);
  const ibrRule = input.vintage === 'old' ? rules.ibrOld.value : rules.ibrNew.value;
  const pslfEligible = plan === 'rap' || plan === 'ibr' || (plan === 'standard' && fixedTerm === rules.standardMonths.value);
  const pslfLeft = allowPslf && input.pslf && pslfEligible ? remainingPslf(input.certified) : Infinity;
  const idrLeft = plan === 'rap' ? Math.max(0, rules.rapMonths.value - input.rapMonthsAlready)
    : plan === 'ibr' ? Math.max(0, ibrRule.months - input.ibrMonthsAlready) : Infinity;
  const maxMonths = Math.min(pslfLeft, idrLeft, plan === 'rap' || plan === 'ibr' ? Infinity : fixedTerm);
  const flags: Result['flags'] = [];
  if (accounts.length > 1) flags.push('multiLoanAllocation');
  if ((plan === 'rap' || plan === 'ibr') && input.filing === 'joint' && input.spouseBalance) flags.push('spouseBalanceForecast');
  if (plan === 'ibr') flags.push('ibrRounding', 'futurePoverty', 'ibrCapitalization', 'payoffReentry');
  if ((plan === 'ibr' || plan === 'rap') && (input.ibrMonthsAlready || input.rapMonthsAlready)) flags.push('priorPlanCredit');
  if (plan === 'tiered' || plan === 'standard') flags.push('fixedSchedule');
  const points: Point[] = [{month:0,balance:opening,payment:0}];
  let paid = 0;
  let interest = 0;
  let months = 0;
  let scheduled = 0;
  const agi = (month: number) => Math.max(0, (input.income + (input.filing === 'joint' ? input.spouseIncome : 0))
    * (1 + input.growth) ** Math.floor(month / annualMonths));
  const amount = (month: number) => plan === 'rap'
    ? rapPayment(agi(month), input.dependents, debt(), input.filing === 'joint' ? input.spouseBalance : 0)
    : plan === 'ibr' ? ibrPayment(input, agi(month), debt(), ibrCap) : fixedPayment;
  const starting = Math.min(amount(0), opening + sum(accounts.map(loan => loan.balance * loan.rate / annualMonths)));

  for (; months < maxMonths && debt() > .005; months++) {
    if (months % annualMonths === 0) scheduled = amount(months);
    const weights = accounts.map(loan => plan === 'rap' || plan === 'ibr'
      ? loan.principal + loan.accrued : loan.principal > .005 ? paymentAtRate(loan.balance, loan.rate, fixedTerm) : 0);
    const weight = sum(weights);
    const accruedThisMonth = accounts.map(loan => loan.principal * loan.rate / annualMonths);
    accounts.forEach((loan, index) => { loan.accrued += accruedThisMonth[index]; });
    const bill = Math.min(debt(), months + 1 === fixedTerm && (plan === 'standard' || plan === 'tiered') ? debt() : scheduled);
    let spent = 0;
    let reduced = 0;
    const apply = (loan: typeof accounts[number], proposed: number) => {
      const toInterest = Math.min(loan.accrued, proposed);
      const toPrincipal = Math.min(loan.principal, proposed - toInterest);
      loan.accrued -= toInterest;
      loan.principal -= toPrincipal;
      interest += toInterest;
      spent += toInterest + toPrincipal;
      reduced += toPrincipal;
    };
    accounts.forEach((loan, index) => apply(loan, weight ? bill * weights[index] / weight : 0));
    accounts.forEach(loan => apply(loan, Math.max(0, bill - spent)));
    accounts.forEach((loan, index) => {
      const subsidized = loan.type === 'subsidized' || loan.type === 'subsidized-consolidation';
      if ((plan === 'rap' && rules.rapWaiver.value) || (plan === 'ibr' && subsidized && months + input.ibrSubsidyUsed < rules.ibrInterestSubsidyMonths.value)) {
        loan.accrued -= Math.min(loan.accrued, accruedThisMonth[index]);
      }
    });
    if (plan === 'rap') {
      const total = principal();
      const match = Math.min(total, Math.max(0, Math.min(rules.rapPrincipalLimit.value, spent) - reduced));
      if (total > 0) accounts.forEach(loan => { loan.principal -= match * loan.principal / total; });
    }
    paid += spent;
    points.push({month:months+1,balance:cents(debt()),payment:cents(spent)});
  }
  const remaining = debt() > .005 ? cents(debt()) : 0;
  const outcome = !remaining ? 'paid' : pslfLeft <= idrLeft ? 'pslf' : 'idr';
  const end = dateAfter(input.start, Math.max(0, months - 1));
  return {
    plan, title: {rap:'Repayment Assistance Plan',ibr: input.vintage === 'old' ? 'Income-Based Repayment · older borrower' : 'Income-Based Repayment · newer borrower',standard:'Legacy Standard',tiered:'Tiered Standard'}[plan],
    starting: cents(points[1]?.payment ?? (months === 0 ? 0 : starting)), paid:cents(paid), interest:cents(interest),
    forgiven: outcome === 'paid' ? 0 : remaining, months, end, outcome, points, flags, badges:[],
    pslfDate: outcome === 'pslf' ? end : null, pslfSavings: null,
  };
}

export function compare(input: Inputs) {
  if (!input.loans.some(loan => loan.balance > 0)) return [];
  const active = {...input, loans:input.loans.filter(loan=>loan.balance>0)};
  const rows = eligible(active).map(plan => {
    const result = simulate(active, plan, true);
    if (result.pslfDate) result.pslfSavings = cents(Math.max(0, simulate(active, plan, false).paid - result.paid));
    return result;
  });
  const lowest = Math.min(...rows.map(row => row.starting));
  const cost = Math.min(...rows.map(row => row.paid));
  const fastest = Math.min(...rows.map(row => row.months));
  const bestPslf = Math.min(...rows.filter(row => row.pslfDate).map(row => row.paid));
  return rows.map(row => ({...row, badges: [
    row.starting === lowest && 'Lowest monthly',
    row.paid === cost && 'Lowest total cost',
    row.months === fastest && 'Fastest',
    row.pslfDate && row.paid === bestPslf && 'Best for PSLF',
  ].filter((item): item is string => typeof item === 'string')}));
}
