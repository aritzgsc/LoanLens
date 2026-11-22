import { describe, expect, it } from 'vitest';
import { compare, example, paymentAtRate, poverty, rapPayment, remainingPslf, rules } from './index';

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
