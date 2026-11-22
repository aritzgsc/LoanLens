import { compare, example, formatUSD, rules } from '../src/lib/engine';
import type { Inputs } from '../src/lib/engine';

const scenarios: Record<string, Partial<Inputs>> = {
  'RAP and new Direct Loan': { vintage: 'new-direct', growth: 0 },
  'Legacy IBR': { vintage: 'old', growth: 0 },
  'Tiered Standard at the debt threshold': { vintage: 'new-direct', growth: 0, initialDebt: rules.tierTerms.value[0][0] ?? 0 },
  'Married filing jointly': { filing: 'joint', spouseIncome: 30000, spouseBalance: 18000, dependents: 1, growth: 0 },
  'Married filing separately': { filing: 'separate', spouseIncome: 30000, spouseBalance: 18000, dependents: 1, growth: 0 },
  'RAP with dependents': { income: 50000, dependents: 2, growth: 0 },
  'Alaska poverty guideline': { region: 'AK', income: 50000, dependents: 1, growth: 0 },
  'Hawaii poverty guideline': { region: 'HI', income: 50000, dependents: 1, growth: 0 },
  'PSLF one month before the threshold': { pslf: true, certified: rules.pslfMonths.value - 1, growth: 0 },
  'Partly repaid Legacy Standard': { vintage: 'old', initialDebt: 30000, loans: [{ balance: 18000, rate: .06, type: 'unsubsidized' }], growth: 0 },
};

console.log('| Case and input overrides | LoanLens plan | First bill | Total paid | Forgiveness | Months | Official Loan Simulator |');
console.log('| --- | --- | --- | --- | --- | --- | --- |');
for (const [name, overrides] of Object.entries(scenarios)) {
  for (const row of compare({ ...example, ...overrides })) {
    const escaped = JSON.stringify(overrides).replaceAll('|', '\\|');
    console.log('| ' + [name + ' ' + escaped, row.title, formatUSD(row.starting), formatUSD(row.paid),
      formatUSD(row.forgiven), row.months, ''].join(' | ') + ' |');
  }
}
