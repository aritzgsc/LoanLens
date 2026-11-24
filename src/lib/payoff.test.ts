import { expect, it } from 'vitest';
import { fixedPayoff, parsePayoffNumber } from './payoff';
it('models a zero-rate loan and a smaller last payment',()=>{
 const result=fixedPayoff(1200,0,12,100);
 expect(result?.regular).toBe(100);
 expect(result?.baseline.months).toBe(12);
 expect(result?.accelerated.months).toBe(6);
 expect(result?.accelerated.interest).toBe(0);
 expect(result?.accelerated.paid).toBe(1200);
 expect(fixedPayoff(1000,0,3,1000)?.accelerated.rows[0].paid).toBe(1000);
});
it('conserves principal and reduces interest when extra payments are made',()=>{
 const result=fixedPayoff(30000,.06,120,100);
 expect(result?.regular.toFixed(2)).toBe('333.06');
 expect(result?.baseline.months).toBe(120);
 expect(result?.accelerated.months).toBeLessThan(120);
 expect(result?.accelerated.interest).toBeLessThan(result!.baseline.interest);
 expect(result?.accelerated.rows.reduce((a,b)=>a+b.principal,0)).toBeCloseTo(30000,6);
 expect(result?.accelerated.rows.at(-1)?.balance).toBeCloseTo(0,6);
});
it('rejects invalid inputs and has equal results with no extra payment',()=>{
 expect(fixedPayoff(100,0,0,0)).toBeNull();
 expect(fixedPayoff(0,0,12,0)).toBeNull();
 expect(fixedPayoff(100,.06,12,-1)).toBeNull();
 expect(parsePayoffNumber('')).toBeNaN();
 expect(parsePayoffNumber('1e3')).toBeNaN();
 const r=fixedPayoff(1000,.04,24,0);
 expect(r?.baseline).toEqual(r?.accelerated);
});
