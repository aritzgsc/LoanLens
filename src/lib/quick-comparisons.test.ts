import { expect, it } from 'vitest';
import { compareStartingPayments, projectCollegeCosts } from './quick-comparisons';
import { rules } from './engine';
it('compares starting payments using the existing RAP and IBR formulas',()=>{
 const r=compareStartingPayments(60000,2,1,350,'contiguous','new-ibr');
 expect(r?.rap).toBe(150);
 expect(r?.ibr).toBeCloseTo(Math.min(350,Math.max(0,60000-1.5*rules.poverty.value.contiguous.first)*.1/12),2);
 expect(compareStartingPayments(0,0,1,350,'contiguous','old')?.ibr).toBe(0);
 expect(compareStartingPayments(60000,2,1,0,'contiguous','new-ibr')).toBeNull();
});
it('compares four-year net price and models award renewal explicitly',()=>{
 expect(projectCollegeCosts(10000,2000,0,4)?.total).toBe(32000);
 expect(projectCollegeCosts(10000,2000,0,1)?.total).toBe(38000);
 expect(projectCollegeCosts(10000,0,10,4)?.total).toBe(46410);
 expect(projectCollegeCosts(10000,10001,0,4)).toBeNull();
 expect(projectCollegeCosts(10000,2000,0,5)).toBeNull();
});
