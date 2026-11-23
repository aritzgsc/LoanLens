import { describe, expect, it } from 'vitest';
import { compare, example, ibrPayment, paymentAtRate, poverty, rapPayment, remainingPslf, rules } from './index';

describe('financial source transparency', () => {
 it('does not present an unknown value as verified', () => {
  for(const [key, rule] of Object.entries(rules)) {
   const item=rule as {status:string;value:unknown;source:string;retrieved:string};
   expect(['VERIFIED','UNVERIFIED'],key).toContain(item.status);
   if(item.value===null) expect(item.status,key).toBe('UNVERIFIED');
   expect(item.source,key).toMatch(/^https:\/\//);
   expect(item.retrieved,key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  }
 });
});
describe('source-checked guide example invariants',()=>{
 it('matches the 2026 RAP $60,001 bracket and equal-spouse-debt guide case',()=>{
  expect(rapPayment(60000,0)).toBe(250);
  expect(rapPayment(60001,0)).toBe(300.01);
  expect(rapPayment(70000,0)).toBe(350);
  expect(rapPayment(75000,1,30000,30000)).toBe(193.75);
 });
 it('calculates both illustrative IBR rates for the guide using documented one-person poverty guideline',()=>{
  const old={...example,vintage:'old' as const,filing:'single' as const,dependents:0,otherFamily:0,region:'contiguous' as const};
  expect(ibrPayment(old,45000,30000,333.06)).toBe(263.25);
  expect(ibrPayment({...old,vintage:'new-ibr'},45000,30000,333.06)).toBe(175.5);
 });
});
describe('repayment estimates', () => {
  it('uses the RAP floor and full AGI brackets', () => {
    expect(rapPayment(0, 0)).toBe(10);
    expect(rapPayment(100000, 0)).toBe(750);
    expect(rapPayment(100001, 0)).toBe(833.34);
    expect(rapPayment(300000, 0)).toBe(2500);
  });
  it('reduces RAP for dependents without reducing it below its floor', () => {
    expect(rapPayment(45000, 1)).toBe(100);
    expect(rapPayment(45000, 9)).toBe(10);
  });
  it('prorates joint debt after the dependent reduction', () => {
    const joint = compare({...example, filing:'joint', spouseIncome:30000, spouseBalance:30000})[0];
    const separate = compare({...example, filing:'separate', spouseIncome:30000, spouseBalance:30000})[0];
    expect(joint.starting).toBe(218.75);
    expect(separate.starting).toBe(150);
    expect(rapPayment(10000, 0, 1, 100000)).toBe(10);
  });
  it('uses the separate HHS schedules', () => {
    expect(poverty('contiguous', 2)).toBe(21640);
    expect(poverty('AK', 2)).toBe(27050);
    expect(poverty('HI', 2)).toBe(24890);
  });
  it('matches the Department of Education fact sheet RAP example', () => {
    // https://www.ed.gov/about/news/press-release/fact-sheet-trump-administration-simplifying-student-loan-repayment
    // The fact sheet gives the monthly interest implicitly: $150 paid plus $40 waived.
    const [rap] = compare({...example, income:45000, loans:[{balance:35000,rate:(150+40)*12/35000,type:'unsubsidized'}]});
    expect(rap.starting).toBe(150);
    expect(rap.points[1].balance).toBe(34950);
  });
  it('uses the FSA monthly estimate of $135 for $27,000 at 6%', () => {
    const [rap, ibr] = compare({...example, income:0, loans:[{balance:27000, rate:.06, type:'unsubsidized'}]});
    expect(ibr.points[1].balance).toBe(27135);
    expect(rap.points[1].balance).toBe(26990);
    expect(ibr.starting).toBe(0);
  });
  it('caps older IBR above the poverty deduction and selects only one variant', () => {
    const rows = compare({...example, income:500000, vintage:'old'});
    expect(rows.filter(row => row.plan === 'ibr')).toHaveLength(1);
    expect(rows[1].starting).toBe(rows[2].starting);
  });
  it('uses sourced IBR adjustments for low positive installments', () => {
    expect(compare({...example,income:24400})[1].starting).toBe(0);
    expect(compare({...example,income:24540})[1].starting).toBe(10);
  });
  it('handles final payments below the RAP and fixed floors', () => {
    const rows = compare({...example, loans:[{balance:7,rate:0,type:'unsubsidized'}]});
    rows.forEach(row => {
      expect(row.paid).toBe(7);
      expect(row.forgiven).toBe(0);
      expect(row.months).toBe(1);
    });
    expect(paymentAtRate(1200,0,120)).toBe(10);
  });
  it('uses the certified count at the PSLF boundary without projecting 121 payments', () => {
    const target = rules.pslfMonths.value;
    expect(remainingPslf(target)).toBe(0);
    const one = compare({...example, pslf:true, certified:target-1})[0];
    const zero = compare({...example, pslf:true, certified:target})[0];
    expect(one.months).toBe(1);
    expect(one.outcome).toBe('pslf');
    expect(zero.paid).toBe(0);
    expect(zero.forgiven).toBe(30000);
    expect(compare({...example, vintage:'new-direct', pslf:true, certified:target}).find(row=>row.plan==='tiered')?.pslfDate).toBeNull();
  });
  it('selects the longer tier at each inclusive lower bound', () => {
    const terms = [24999,25000,50000,100000].map(initialDebt =>
      compare({...example,vintage:'new-direct',initialDebt})[1].months);
    expect(terms).toEqual([120,180,240,300]);
  });
  it('routes complex loan types to eligibility guidance', () => {
    expect(compare({...example,loans:[{...example.loans[0],type:'parent-plus'}]})).toEqual([]);
  });
});

describe('independent arithmetic and projection invariants', () => {
  it('uses the standard fixed-payment amortization formula for one 6% loan', () => {
    expect(paymentAtRate(30000, .06, 120)).toBeCloseTo(333.0615, 3);
    const rows = compare({...example, loans:[{balance:30000,rate:.06,type:'unsubsidized'}]});
    const fixed = rows.find(row => row.plan === 'standard');
    expect(fixed).toBeDefined();
    expect(fixed?.starting).toBeCloseTo(333.06,2);
    expect(fixed?.months).toBe(120);
    expect(fixed?.forgiven).toBe(0);
    expect(fixed?.paid).toBeGreaterThan(30000);
    expect(fixed?.paid).toBeCloseTo(30000+(fixed?.interest||0),1);
  });
  it('does not invent interest on a zero-rate loan or charge more than principal', () => {
    const rows = compare({...example,loans:[{balance:1200,rate:0,type:'unsubsidized'}]});
    for(const row of rows) {
      expect(row.interest).toBe(0);
      expect(row.paid).toBeLessThanOrEqual(1200);
      expect(row.forgiven).toBeGreaterThanOrEqual(0);
    }
    const fixed = rows.find(row => row.plan==='standard');
    expect(fixed?.paid).toBe(1200);
    expect(fixed?.forgiven).toBe(0);
  });
  it('applies RAP percentages at the correct inclusive income boundaries', () => {
    expect(rapPayment(10000,0)).toBe(10);
    expect(rapPayment(20000,0)).toBe(16.67);
    expect(rapPayment(30000,0)).toBe(50);
    expect(rapPayment(40000,0)).toBe(100);
    expect(rapPayment(50000,0)).toBe(166.67);
    expect(rapPayment(60000,0)).toBe(250);
    expect(rapPayment(70000,0)).toBe(350);
    expect(rapPayment(80000,0)).toBe(466.67);
    expect(rapPayment(90000,0)).toBe(600);
    expect(rapPayment(100000,0)).toBe(750);
    expect(rapPayment(100001,0)).toBe(833.34);
  });
  it('keeps all modeled balances and cash payments finite and nonnegative', () => {
    const scenarios = [
      {...example, income:0,loans:[{balance:27000,rate:.06,type:'unsubsidized' as const}]},
      {...example, income:85000,loans:[{balance:12000,rate:0,type:'subsidized' as const}]},
      {...example, income:75000,filing:'joint' as const,spouseIncome:20000,spouseBalance:15000,dependents:2},
      {...example, income:45000,loans:[{balance:7000,rate:.04,type:'subsidized' as const},{balance:30000,rate:.075,type:'unsubsidized' as const}]},
    ];
    for (const scenario of scenarios) for (const row of compare(scenario)) {
      expect(row.months).toBeGreaterThanOrEqual(0);
      expect(row.months).toBeLessThanOrEqual(360);
      expect(row.paid).toBeGreaterThanOrEqual(0);
      expect(row.interest).toBeGreaterThanOrEqual(0);
      expect(row.forgiven).toBeGreaterThanOrEqual(0);
      for(const point of row.points) {
        expect(Number.isFinite(point.balance)).toBe(true);
        expect(Number.isFinite(point.payment)).toBe(true);
        expect(point.balance).toBeGreaterThanOrEqual(0);
        expect(point.payment).toBeGreaterThanOrEqual(0);
      }
    }
  });
  it('does not pretend mixed or unsupported loan types have confirmed plan eligibility', () => {
    expect(compare({...example,loans:[{balance:10000,rate:.06,type:'private'}]})).toEqual([]);
    expect(compare({...example,loans:[{balance:10000,rate:.06,type:'parent-plus'}]})).toEqual([]);
    expect(compare({...example,vintage:'unknown'})).toEqual([]);
    expect(compare({...example,loans:[{balance:0,rate:0,type:'unsubsidized'}]})).toEqual([]);
  });
});
