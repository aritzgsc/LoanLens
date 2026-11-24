import { useState } from 'preact/hooks';
import { formatUSD, rules, type Region } from '../lib/engine';
import { compareStartingPayments } from '../lib/quick-comparisons';
import { parsePayoffNumber } from '../lib/payoff';
const fields=[
 ['Annual AGI (USD)','45000','0.01',0,100000000],
 ['RAP tax dependents','0','1',0,30],
 ['IBR family size','1','1',1,31],
 ['Confirmed monthly IBR cap (USD)','350','0.01',0.01,100000000],
] as const;
export default function RapIbrComparison(){
 const [values,setValues]=useState<string[]>(fields.map(f=>f[1]));
 const [region,setRegion]=useState<Region>('contiguous');
 const [vintage,setVintage]=useState<'old'|'new-ibr'>('new-ibr');
 const [agi,dependents,family,cap]=values.map(parsePayoffNumber);
 const result=compareStartingPayments(agi,dependents,family,cap,region,vintage);
 return <section class="tool-pane card" aria-label="RAP versus IBR starting payment comparison">
 <p>Hypothetical example defaults. Confirm the IBR cap and borrower rules before entering account-specific figures.</p>
 <div class="fields">{fields.map(([label,,step,min,max],index)=><label class="field" key={label}><span>{label}</span><input type="number" min={min} max={max} step={step} inputMode="decimal" value={values[index]} onInput={e=>{const value=e.currentTarget.value;setValues(old=>old.map((v,i)=>i===index?value:v));}}/></label>)}
 <label class="field">IBR poverty guideline region<select value={region} onChange={e=>setRegion(e.currentTarget.value as Region)}><option value="contiguous">48 contiguous states and DC</option><option value="AK">Alaska</option><option value="HI">Hawaii</option></select></label>
 <label class="field">IBR borrower rules<select value={vintage} onChange={e=>setVintage(e.currentTarget.value as 'old'|'new-ibr')}><option value="new-ibr">Newer IBR borrower (10%)</option><option value="old">Older IBR borrower (15%)</option></select></label></div>
 <div class="notice" aria-live="polite">{result?<dl><div><dt>Estimated RAP starting monthly payment</dt><dd>{formatUSD(result.rap)}</dd></div><div><dt>Estimated IBR starting monthly payment</dt><dd>{formatUSD(result.ibr)}</dd></div></dl>:<p>Enter valid scenario values, including the IBR cap.</p>}</div>
 <p>Uses the poverty guideline schedule effective {rules.poverty.effective}. This comparison assumes no eligible spouse debt, and does not model plan eligibility, forgiveness, taxes or lifetime costs. Confirm family size and tax dependents separately.</p>
 </section>;
}
