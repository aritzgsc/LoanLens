import { paymentAtRate } from './engine';
export type PayoffRow = { month:number; paid:number; interest:number; principal:number; balance:number };
export function fixedPayoff(balance:number, annualRate:number, months:number, extra:number) {
  if (![balance,annualRate,months,extra].every(Number.isFinite) || balance <= 0 || balance > 1e8 || annualRate < 0 || annualRate > 1 || !Number.isInteger(months) || months < 1 || months > 480 || extra < 0 || extra > 1e8) return null;
  const regular=paymentAtRate(balance,annualRate,months);
  const project=(additional:number)=>{
    let remaining=balance, interest=0, paid=0;
    const rows:PayoffRow[]=[];
    for(let month=1;month<=months && remaining>1e-8;month++){
      const charge=remaining*annualRate/12;
      const payment=Math.min(remaining+charge,month===months?remaining+charge:regular+additional);
      const principal=Math.min(remaining,payment-charge);
      remaining=Math.max(0,remaining-principal);
      interest+=charge;paid+=payment;
      rows.push({month,paid:payment,interest:charge,principal,balance:remaining});
    }
    return {months:rows.length,interest,paid,rows};
  };
  return {regular,baseline:project(0),accelerated:project(extra)};
}
export function parsePayoffNumber(value:string) {
  return /^\d+(?:\.\d+)?$/.test(value.trim()) ? Number(value) : NaN;
}
