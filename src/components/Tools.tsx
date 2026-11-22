import { useState } from 'preact/hooks';
import { annualMonths, dateAfter, dateLabel, example, formatUSD, rapPayment, remainingPslf, rules } from '../lib/engine';
const money = formatUSD;
export type Tool = 'deadlines'|'married'|'parent'|'pslf'|'income';
export const toolTitles: Record<Tool,{title:string;description:string}> = {
  deadlines:{title:'Student loan repayment deadlines',description:'Find the timeline that applies to SAVE, PAYE, ICR and Parent PLUS borrowers.'},
  married:{title:'Married RAP payment calculator',description:'See how joint income, a spouse’s eligible debt and dependents affect your monthly estimate.'},
  parent:{title:'Parent PLUS consolidation deadline and options',description:'Check which questions to ask your servicer based on consolidation and repayment history.'},
  pslf:{title:'PSLF payment tracker',description:'Use your certified count to estimate how many qualifying monthly payments remain.'},
  income:{title:'RAP payment by income',description:'Explore how adjusted gross income and claimed dependents change estimated monthly payments.'},
};
const currentMonth = () => new Date().toISOString().slice(0,7);
const usd = (amount: number) => formatUSD(amount, 'whole');
const day = (value:string, add:number) => {
  const date = new Date(value+'T00:00:00Z');
  if (!Number.isFinite(date.valueOf())) return 'Enter a valid notice date';
  date.setUTCDate(date.getUTCDate()+add);
  return date.toISOString().slice(0,10);
};
function N({label,help,value,max=100000000,currency=false,change}:{label:string;help:string;value:number;max?:number;currency?:boolean;change:(value:number)=>void}) {
  const [editing,setEditing]=useState<string|null>(null);
  return <label class="field"><span>{label}</span>
    <input inputMode={currency ? 'decimal' : 'numeric'}
      value={editing ?? (currency ? formatUSD(value, Number.isInteger(value) ? 'whole' : 'exact') : value)}
      // Switch to the editable raw value synchronously. Avoid scheduling a
      // focus-state rerender that can overwrite a quick paste before onInput.
      onFocus={event => { event.currentTarget.value = String(value); }}
      onBlur={() => setEditing(null)}
      onInput={event => {
        const raw = event.currentTarget.value;
        setEditing(raw);
        const normalized = raw.replaceAll(',', '').replace(/^\$/, '');
        const valid = currency ? /^\d*(?:\.\d{0,2})?$/.test(normalized) : /^\d*$/.test(normalized);
        const amount = Number(normalized);
        if (valid && Number.isFinite(amount) && amount >= 0 && amount <= max) change(amount);
      }}/>
    <small class="field-hint">{help}</small>
  </label>;
}
function Deadlines() {
  const [plan,setPlan]=useState('save');
  const [notice,setNotice]=useState('');
  const [noticeType,setNoticeType]=useState('first');
  const days = noticeType==='first'?rules.saveNoticeDays.value:rules.saveFinalNoticeDays.value;
  return <>
    <ol class="tool-pane card">
      <li><strong>{rules.newLoanDate.value}.</strong> RAP and Tiered Standard take effect. New Direct Loans can change options across the portfolio.</li>
      <li><strong>When your SAVE notice arrives.</strong> The first notice allows {rules.saveNoticeDays.value} days to choose an eligible plan. A later final notice has its own {rules.saveFinalNoticeDays.value}-day window.</li>
      <li><strong>{rules.sunsetDate.value}.</strong> PAYE and ICR transition deadline.</li>
    </ol>
    <section class="tool-pane card"><h2>Which deadline applies to me?</h2>
    <label class="field">Current plan or situation<small class="field-hint">Use the plan listed in your servicer account.</small><select value={plan} onChange={e=>setPlan(e.currentTarget.value)}>
      <option value="save">SAVE</option><option value="paye">PAYE</option><option value="icr">ICR</option><option value="parent">Parent PLUS</option><option value="other">Another plan or unsure</option>
    </select></label>
    {plan==='save' && <div class="fields"><label class="field">Notice date<input type="date" value={notice} onInput={e=>setNotice(e.currentTarget.value)}/></label><label class="field">Notice type<select value={noticeType} onChange={e=>setNoticeType(e.currentTarget.value)}><option value="first">First notice</option><option value="final">Final notice</option></select></label></div>}
    <p class="notice" aria-live="polite">{plan==='save'?notice?`Estimated deadline: ${day(notice,days)}. Use the date printed in your notice when it differs.`:'Check your servicer inbox for your personal deadline.'
      :plan==='paye'||plan==='icr'?`Choose an eligible replacement before ${rules.sunsetDate.value}. Contact your servicer if Parent PLUS debt is involved.`
        :plan==='parent'?<a href="/tools/parent-plus-consolidation-checker/">Check the Parent PLUS transition pathway</a>:'Confirm your current plan and messages in your servicer account.'}</p>
    {plan==='save' && <p class="warning">Prior payment credit is unverified for this scenario. {rules.saveHistory.note}</p>}
    <a href={rules.saveNoticeDays.source}>Read Federal Student Aid’s SAVE guidance</a></section>
  </>;
}
function Married() {
  const [income,setIncome]=useState(example.income);
  const [spouse,setSpouse]=useState(30000);
  const [debt,setDebt]=useState(example.loans[0].balance);
  const [spouseDebt,setSpouseDebt]=useState(0);
  const [jointDeps,setJointDeps]=useState(1);
  const [separateDeps,setSeparateDeps]=useState(1);
  return <section class="tool-pane card"><div class="fields">
    <N label="Your adjusted gross income" help="Enter your annual income in dollars after adjustments." currency value={income} change={setIncome}/>
    <N label="Spouse’s adjusted gross income" help="Enter their annual income in dollars after adjustments." currency value={spouse} change={setSpouse}/>
    <N label="Your eligible loan balance" help="Use your current eligible federal balance in dollars." currency value={debt} change={setDebt}/>
    <N label="Spouse’s eligible loan balance" help="Enter dollars, or zero if your spouse has no eligible loans." currency value={spouseDebt} change={setSpouseDebt}/>
    <N label="Dependents on the joint return" help="Count everyone claimed together." value={jointDeps} max={30} change={setJointDeps}/>
    <N label="Dependents on your separate return" help="Count only the dependents you would claim." value={separateDeps} max={30} change={setSeparateDeps}/>
  </div><div class="notice" aria-live="polite">{debt>0?<dl>
    <div><dt>Joint filing</dt><dd>{money(rapPayment(income+spouse,jointDeps,debt,spouseDebt))} / month</dd></div>
    <div><dt>Separate filing</dt><dd>{money(rapPayment(income,separateDeps))} / month</dd></div>
  </dl>:'Enter your eligible loan balance to see a payment comparison.'}</div>
  <p>This is one borrower’s student loan payment. Compare both spouses’ payments together with any change in taxes and credits before deciding how to file.</p></section>;
}
function Parent() {
  const [choice,setChoice]=useState('unknown');
  const [payment,setPayment]=useState('unknown');
  return <section class="tool-pane card">
    <label class="field">When was your Parent PLUS consolidation loan disbursed?<small class="field-hint">Use the disbursement date in your federal loan record.</small><select value={choice} onChange={e=>setChoice(e.currentTarget.value)}>
      <option value="unknown">I’m unsure</option><option value="never">I have not consolidated</option><option value="before">Before {rules.parentConsolidationBefore.value}</option><option value="after">On or after {rules.parentConsolidationBefore.value}</option>
    </select></label>
    {choice==='before' && <label class="field">Made an ICR payment on that consolidation loan?<small class="field-hint">Check your payment history for that specific loan.</small><select value={payment} onChange={e=>setPayment(e.currentTarget.value)}>
      <option value="unknown">I’m unsure</option><option value="yes">Yes</option><option value="no">No</option></select></label>}
    <div class="notice" aria-live="polite">{choice==='before'?(payment==='yes'?'Ask your servicer to confirm that you qualify for the IBR transition and that your ICR payment is recorded.':`Ask your servicer about timely ICR enrollment and the required payment before the ${rules.sunsetDate.value} transition.`)
      :choice==='after'||choice==='never'?'Consolidating now generally does not open this ICR-to-IBR pathway. Ask which fixed repayment options apply to your loans.'
        :'Check the consolidation disbursement date and underlying loan types in your aid history.'}</div>
    <p class="warning"><strong>Operational cutoff unverified.</strong> {rules.parentOperationalCutoff.note}</p>
    <a href={rules.parentIcrPayments.source}>Read Federal Student Aid’s Parent PLUS guidance</a>
  </section>;
}
function Pslf() {
  const [certified,setCertified]=useState(0);
  const [start,setStart]=useState(currentMonth);
  const left=remainingPslf(certified);
  return <section class="tool-pane card">
    <div class="fields"><N label="Certified qualifying payments for one loan" help="Use the count shown in your StudentAid.gov account." value={certified} max={rules.pslfMonths.value} change={setCertified}/>
      <label class="field">Next qualifying payment month<input type="month" min="2000-01" max="2099-12" value={start} onInput={e=>{if(/^2\d{3}-(0[1-9]|1[0-2])$/.test(e.currentTarget.value))setStart(e.currentTarget.value);}}/></label></div>
    <p class="notice" aria-live="polite">{left?`${left} qualifying payments left. Estimated target: ${dateLabel(dateAfter(start,left-1))}.`:'Payment count reached. Check employment certification and apply through the PSLF Help Tool.'}</p>
    <p>Enter the count separately for any loan that has a different payment history. This assumes you continue making qualifying payments with eligible employment.</p>
    <a href="https://studentaid.gov/pslf/">Open the PSLF Help Tool</a>
  </section>;
}
function Income() {
  const [dependents,setDependents]=useState(0);
  const table = rules.rapBands.value.map(([limit,rate],i)=>{
    const lower = i===0?0:rules.rapBands.value[i-1][0]??0;
    return {range:i===0?`Up to ${usd(limit ?? 0)}`:limit===null?`Above ${usd(lower)}`:`Above ${usd(lower)} through ${usd(limit)}`,
      rate:(rate??0)*100,example:limit ?? lower+10000};
  });
  return <section class="tool-pane card"><N label="Dependents claimed on your return" help="Use the count from the tax return that supplies your income." value={dependents} max={30} change={setDependents}/>
    <div class="table-wrap" role="region" tabIndex={0} aria-label="RAP payments by income bracket"><table><caption>Borrower with no eligible spouse debt. Starting monthly payment uses the sample AGI.</caption><thead><tr><th scope="col">AGI bracket</th><th scope="col">Full AGI rate</th><th scope="col">Sample AGI</th><th scope="col">Monthly payment</th></tr></thead><tbody>{table.map(row=><tr key={row.range}><th scope="row">{row.range}</th><td>{row.rate}%</td><td>{usd(row.example)}</td><td>{money(rapPayment(row.example,dependents))}</td></tr>)}</tbody></table></div>
    <p>The assigned rate applies to full AGI, divided by {annualMonths}, before the dependent reduction and payment floor.</p>
  </section>;
}
export default function Tools({kind}:{kind:Tool}) {
  const Pane = {deadlines:Deadlines,married:Married,parent:Parent,pslf:Pslf,income:Income}[kind];
  return <div class="tool-pane"><Pane/></div>;
}
