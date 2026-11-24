import { useState } from 'preact/hooks';
import { fixedPayoff, parsePayoffNumber } from '../lib/payoff';
import { formatUSD } from '../lib/engine';
const fields=[
 ['Outstanding balance (USD)','Current principal, excluding separate unpaid interest.','30000','0.01',1,100000000],
 ['Annual fixed interest rate (%)','Enter a percentage, such as 6 for 6%.','6','any',0,100],
 ['Remaining repayment months','The remaining term from 1 to 480 months.','120','1',1,480],
 ['Extra monthly payment (USD)','Hypothetical amount added to the regular payment.','100','0.01',0,100000000],
] as const;
export default function PayoffCalculator(){
 const [values,setValues]=useState<string[]>(fields.map(f=>f[2]));
 const [balance,rate,months,extra]=values.map(parsePayoffNumber);
 const result=fixedPayoff(balance,rate/100,months,extra);
 const [monthly,setMonthly]=useState(false);
 const money=formatUSD;
 const rows=result?.accelerated.rows??[];
 const groups=monthly?rows:rows.filter(row=>row.month%12===0||row.month===rows.length).map(row=>{
   const segment=rows.slice(Math.floor((row.month-1)/12)*12,row.month);
   return {...row,paid:segment.reduce((a,b)=>a+b.paid,0),interest:segment.reduce((a,b)=>a+b.interest,0),principal:segment.reduce((a,b)=>a+b.principal,0)};
 });
 return <section id="payoff-workspace" class="tool-pane card" aria-label="Fixed-rate payoff calculator">
 <div class="fields">{fields.map(([label,hint,,step,min,max],index)=><label class="field" key={label}><span>{label}</span><input type="number" inputMode="decimal" min={min} max={max} step={step} value={values[index]} onInput={e=>{const value=e.currentTarget.value;setValues(old=>old.map((v,i)=>i===index?value:v));}}/><small class="field-hint">{hint}</small></label>)}</div>
 {result?<><div class="result-grid" aria-live="polite">
 <section class="plan card"><h2>Without extra payments</h2><dl><div><dt>Regular monthly payment</dt><dd>{money(result.regular)}</dd></div><div><dt>Payoff time</dt><dd>{result.baseline.months} months</dd></div><div><dt>Total interest</dt><dd>{money(result.baseline.interest)}</dd></div><div><dt>Total paid</dt><dd>{money(result.baseline.paid)}</dd></div></dl></section>
 <section class="plan card"><h2>With extra payments</h2><dl><div><dt>Planned monthly payment</dt><dd>{money(result.regular+extra)}</dd></div><div><dt>Payoff time</dt><dd>{result.accelerated.months} months</dd></div><div><dt>Total interest</dt><dd>{money(result.accelerated.interest)}</dd></div><div><dt>Total paid</dt><dd>{money(result.accelerated.paid)}</dd></div></dl></section></div>
 <p class="notice"><strong>Modeled difference:</strong> {money(Math.max(0,result.baseline.interest-result.accelerated.interest))} less interest and {result.baseline.months-result.accelerated.months} fewer months. The final payment may be smaller than the planned amount.</p>
 <h2>Amortization schedule with extra payments</h2><label class="field">Schedule detail<select value={monthly?'monthly':'annual'} onChange={e=>setMonthly(e.currentTarget.value==='monthly')}><option value="annual">Annual summary</option><option value="monthly">Monthly detail</option></select></label>
 <div class="table-wrap" role="region" tabIndex={0} aria-label="Amortization schedule"><table><caption>Estimated payments and balance by period, rounded for display.</caption><thead><tr><th scope="col">End month</th><th scope="col">Paid</th><th scope="col">Interest</th><th scope="col">Principal</th><th scope="col">Balance</th></tr></thead><tbody>{groups.map(row=><tr key={row.month}><th scope="row">{row.month}</th><td>{money(row.paid)}</td><td>{money(row.interest)}</td><td>{money(row.principal)}</td><td>{money(row.balance)}</td></tr>)}</tbody></table></div></>:<p class="notice" role="status">Enter valid values in all four fields.</p>}
 <p>Illustrative fixed-rate monthly amortization only. No fees, forgiveness, subsidies, variable rates or existing unpaid interest are modeled. Extra payments are assumed to reduce principal after the month's interest.</p>
 </section>;
}
