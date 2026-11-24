import { example, ibrPayment, rapPayment, type Region } from './engine';
export function compareStartingPayments(agi:number, dependents:number, familySize:number, cap:number, region:Region, vintage:'old'|'new-ibr') {
 if (![agi,dependents,familySize,cap].every(Number.isFinite) || agi<0 || agi>1e8 || !Number.isInteger(dependents) || dependents<0 || dependents>30 || !Number.isInteger(familySize) || familySize<1 || familySize>31 || cap<=0 || cap>1e8) return null;
 if (!['contiguous','AK','HI'].includes(region) || !['old','new-ibr'].includes(vintage)) return null;
 return {rap:rapPayment(agi,dependents),ibr:ibrPayment({...example,filing:'single',dependents:0,otherFamily:familySize-1,region,vintage},agi,0,cap)};
}
export function projectCollegeCosts(cost:number, giftAid:number, increase:number, renewalYears:number) {
 if (![cost,giftAid,increase,renewalYears].every(Number.isFinite) || cost<=0 || cost>1e8 || giftAid<0 || giftAid>cost || increase<0 || increase>100 || !Number.isInteger(renewalYears) || renewalYears<1 || renewalYears>4) return null;
 const rows=Array.from({length:4},(_,i)=>{
  const annualCost=Math.round(cost*(1+increase/100)**i*100)/100;
  const aid=i<renewalYears?giftAid:0;
  return {year:i+1,cost:annualCost,aid,net:Math.round((annualCost-aid)*100)/100};
 });
 return {rows,total:rows.reduce((sum,row)=>sum+Math.round(row.net*100),0)/100};
}
