import { useState } from 'preact/hooks';
import { formatUSD } from '../lib/engine';
import { projectCollegeCosts } from '../lib/quick-comparisons';
import { parsePayoffNumber } from '../lib/payoff';
const schools=['School A','School B'] as const;
const fields=[['first-year cost (USD)','0.01',1,100000000],['annual gift aid (USD)','0.01',0,100000000],['annual cost increase (%)','any',0,100],['years of gift aid renewal (including year one)','1',1,4]] as const;
const examples=[['30000','12000','3','4'],['36000','19000','3','4']];
export default function FourYearCollegeCosts(){
 const [values,setValues]=useState(examples);
 const results=values.map(v=>{const [cost,aid,growth,years]=v.map(parsePayoffNumber);return projectCollegeCosts(cost,aid,growth,years);});
 const [a,b]=results;
 return <section class="tool-pane card" aria-label="Four-year college net price calculator">
 <p>Hypothetical amounts, not verified offers. Gift aid stays fixed for the selected years and is zero afterward; costs increase by the entered percentage each year.</p>
 <div class="result-grid">{schools.map((school,i)=><fieldset class="loan-row" key={school}><legend>{school}</legend><div class="tool-pane">{fields.map(([label,step,min,max],j)=><label class="field" key={label}><span>{school} {label}</span><input type="number" min={min} max={max} step={step} inputMode="decimal" value={values[i][j]} onInput={e=>{const value=e.currentTarget.value;setValues(old=>old.map((row,k)=>i===k?row.map((v,l)=>j===l?value:v):row));}}/></label>)}</div></fieldset>)}</div>
 {a&&b?<><div class="notice" aria-live="polite"><dl><div><dt>School A estimated four-year net price</dt><dd>{formatUSD(a.total)}</dd></div><div><dt>School B estimated four-year net price</dt><dd>{formatUSD(b.total)}</dd></div></dl><p>{a.total===b.total?'The scenarios have equal estimated net price.':(a.total<b.total?'School A':'School B')+' has '+formatUSD(Math.abs(a.total-b.total))+' lower modeled net price.'}</p></div><div class="table-wrap" role="region" tabIndex={0} aria-label="Annual college net price comparison"><table><caption>Annual estimated net price before loans</caption><thead><tr><th scope="col">Year</th><th scope="col">School A</th><th scope="col">School B</th></tr></thead><tbody>{a.rows.map((row,i)=><tr key={row.year}><th scope="row">{row.year}</th><td>{formatUSD(row.net)}</td><td>{formatUSD(b.rows[i].net)}</td></tr>)}</tbody></table></div></>:<p class="notice" role="status">Enter valid costs, gift aid and renewal assumptions for both schools.</p>}
 <p>Excludes financing costs, work-study earnings and changes in enrollment. Confirm future costs and renewable awards with each college; loans do not reduce net price.</p>
 </section>;
}
