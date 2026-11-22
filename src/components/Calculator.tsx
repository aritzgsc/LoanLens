import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { compare, dateLabel, example, money, rules } from '../lib/engine';
import type { Inputs, Loan, LoanType, Result } from '../lib/engine';

const labels: Record<LoanType,string> = {'subsidized':'Direct Subsidized','unsubsidized':'Direct Unsubsidized','grad-plus':'Graduate PLUS','direct-consolidation':'Direct Consolidation','subsidized-consolidation':'Subsidized Direct Consolidation','parent-plus':'Parent PLUS','parent-consolidation':'Consolidated Parent PLUS','ffel':'FFEL or Perkins','private':'Private'};
const steps = ['Loans', 'Income and household', 'Goals'];
const stepHints = ['Enter loan balances and rates', 'Add income and family details', 'Review assumptions and compare'];
const colors = ['var(--accent)', 'var(--chart-alt)', 'var(--ink)'];
const today = () => new Date().toISOString().slice(0,7);
const fresh = (): Inputs => ({...example, start:today(), loans:[{balance:0,rate:0,type:'unsubsidized'}], income:0, growth:0, vintage:'unknown'});
const sample = (): Inputs => ({...example,start:today()});
const numberFormat = new Intl.NumberFormat('en-US',{maximumFractionDigits:2});
const safe = (value: unknown, max = 100000000, min = 0) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
const monthOk = (value: unknown) => typeof value === 'string' && /^[2][0-9]{3}-(0[1-9]|1[0-2])$/.test(value);
function restore(raw: unknown): Inputs | null {
  if (!raw || typeof raw !== 'object') return null;
  const i = raw as Inputs;
  if (!Array.isArray(i.loans) || !i.loans.length || i.loans.length > 30
    || !i.loans.every(l => l && Object.hasOwn(labels,l.type) && safe(l.balance) && safe(l.rate,1))) return null;
  if (![i.income,i.spouseIncome,i.spouseBalance,i.initialDebt,i.ibrCap].every(x=>safe(x))
    || ![i.dependents,i.otherFamily,i.ibrSubsidyUsed,i.ibrMonthsAlready,i.rapMonthsAlready,i.certified].every(x=>safe(x,360) && Number.isInteger(x))
    || !safe(i.growth,1,-.99) || !monthOk(i.start) || typeof i.pslf !== 'boolean'
    || !['single','joint','separate'].includes(i.filing) || !Object.hasOwn(rules.poverty.value,i.region)
    || !['old','new-ibr','new-direct','unknown'].includes(i.vintage)) return null;
  const {loans,income,spouseIncome,spouseBalance,filing,growth,dependents,otherFamily,region,vintage,initialDebt,ibrCap,ibrSubsidyUsed,ibrMonthsAlready,rapMonthsAlready,pslf,certified,start} = i;
  return {loans:loans.map(({balance,rate,type})=>({balance,rate,type})),income,spouseIncome,spouseBalance,filing,growth,dependents,otherFamily,region,vintage,initialDebt,ibrCap,ibrSubsidyUsed,ibrMonthsAlready,rapMonthsAlready,pslf,certified,start};
}
function NumberField({label,value,onChange,prefix='',suffix='',max=100000000,min=0,integer=false}:{
  label:string;value:number;onChange:(n:number)=>void;prefix?:string;suffix?:string;max?:number;min?:number;integer?:boolean;
}) {
  const [editing,setEditing] = useState<string|null>(null);
  const n = Number(editing?.replaceAll(',','') || 0);
  const invalid = editing !== null && (!safe(n,max,min) || (integer && !Number.isInteger(n)));
  return <label class="field"><span>{label}</span><span class="numeric">{prefix && <span aria-hidden="true">{prefix}</span>}<input
    inputMode={integer?'numeric':'decimal'} value={editing ?? numberFormat.format(value)} aria-invalid={invalid}
    onFocus={()=>setEditing(previous=>previous ?? String(value))} onBlur={()=>{if (!invalid) setEditing(null);}}
    onInput={e=>{const raw=e.currentTarget.value; setEditing(raw); const next=Number(raw.replaceAll(',',''));
      if (safe(next,max,min) && (!integer || Number.isInteger(next))) onChange(next);}}/>{suffix && <span aria-hidden="true">{suffix}</span>}</span>
    {invalid && <small role="alert">Enter {integer?'a whole number':'an amount'} from {min} to {numberFormat.format(max)}.</small>}</label>;
}
function Field({label,children}:{label:string;children:ComponentChildren}) {
  return <label class="field"><span>{label}</span>{children}</label>;
}
function Chart({rows,metric}:{rows:Result[];metric:'balance'|'payment'}) {
  const maxYears = Math.max(1, ...rows.map(row => Math.ceil(row.months / 12)));
  const x = (month: number) => 85 + 490 * month / (maxYears * 12);
  const max = Math.max(1,...rows.flatMap(result=>result.points.map(point=>point[metric])));
  const title = metric === 'balance' ? 'Balance over time' : 'Monthly payment over time';
  const y = (amount: number) => 152 - 118 * amount / max;
  const tickStep = Math.max(1, Math.ceil(maxYears / 5));
  const ticks = Array.from({length:Math.ceil(maxYears / tickStep)}, (_, index) => index * tickStep).concat(maxYears);
  const dash = ['none', '10 5', '2 5'];
  const coords = (row: Result) => row.points.flatMap(point => {
    if (metric === 'balance') return [[x(point.month), y(point.balance)]];
    if (point.month === 0) return [];
    const amount = y(point.payment);
    return [[x(point.month - 1), amount], [x(point.month), amount]];
  }).map(point => point.join(',')).join(' ');
  return <figure class="chart card">
    <figcaption><h3>{title}</h3></figcaption>
    <div class="chart-scroll" role="region" tabIndex={0} aria-label={title+' chart. Scroll horizontally on small screens.'}>
    <svg viewBox="0 0 600 205" role="img" aria-label={title+' in dollars by year. Detailed points follow in a table.'}>
      <text x="85" y="18">{metric === 'balance' ? 'Loan balance (USD)' : 'Monthly payment (USD)'}</text>
      {[0,.5,1].map(part => <g key={part}>
        <path d={`M85 ${y(max * part)}H575`} stroke="var(--line)"/>
        <text x="77" y={y(max * part) + 4} text-anchor="end">{money(max * part, 'whole')}</text>
      </g>)}
      {ticks.map(year => <text key={year} x={x(year * 12)} y="174" text-anchor="middle">{year}</text>)}
      <text x="330" y="195" text-anchor="middle">Years</text>
      {rows.map((row,i) => <polyline key={row.plan} points={coords(row)} fill="none" stroke={colors[i]} stroke-dasharray={dash[i]} stroke-width="3"/>)}
    </svg>
    </div>
    <p class="chart-scroll-hint">On a narrow screen, scroll the chart sideways to read the full scale.</p>
    <ul class="legend chart-legend">{rows.map((row,i) => <li key={row.plan}><svg viewBox="0 0 26 8" aria-hidden="true" focusable="false"><path d="M0 4H26" stroke={colors[i]} stroke-dasharray={dash[i]} stroke-width="3"/></svg>{row.title}</li>)}</ul>
    <p class="muted">Each line ends at the projected payoff or forgiveness date.</p>
    <details><summary>View chart data</summary><div class="table-wrap" role="region" tabIndex={0} aria-label={title + " data"}><table><thead><tr><th scope="col">Plan</th><th scope="col">Month</th><th scope="col">Amount</th></tr></thead>
      <tbody>{rows.flatMap(row=>row.points.filter(p=>p.month===1 || p.month===row.months || (p.month % 12 === 0 && metric==='balance')).map(p=><tr key={row.plan+p.month}><th scope="row">{row.title}</th><td>{p.month}</td><td>{money(p[metric])}</td></tr>))}</tbody></table></div></details>
  </figure>;
}

export default function Calculator() {
  const [input,setInput] = useState<Inputs>(()=>({...example, loans:[{balance:0,rate:0,type:'unsubsidized'}], income:0, growth:0, vintage:'unknown'}));
  const [step,setStep] = useState(0);
  const [version,setVersion] = useState(0);
  const [submitted,setSubmitted] = useState(false);
  const [message,setMessage] = useState('');
  const [shareUrl,setShareUrl] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const [moved,setMoved] = useState(false);
  useEffect(()=>{
    const read = () => {
      const hash = location.hash;
      if (!hash.startsWith('#scenario=')) return;
      try {
        const restored = restore(JSON.parse(decodeURIComponent(hash.slice(10))));
        if (!restored) throw Error('invalid scenario');
        setInput(restored); setSubmitted(true); setStep(2); setVersion(v=>v+1);
        history.replaceState(null,'',location.pathname+location.search);
      } catch { setMessage('This scenario link could not be read. You can enter a new scenario.'); }
    };
    setInput(fresh()); read();
    window.addEventListener('hashchange',read);
    return ()=>window.removeEventListener('hashchange',read);
  },[]);
  useEffect(()=>{ if(moved) heading.current?.focus(); },[step,moved]);
  const rows = useMemo(()=>submitted ? compare(input) : [],[input,submitted]);
  const alerts = [...new Set(rows.flatMap(row=>row.flags))];
  const hasBalance = input.loans.some(l=>l.balance>0);
  const update = <K extends keyof Inputs>(key:K,value:Inputs[K])=>setInput(prev=>({...prev,[key]:value}));
  const updateLoan = (index:number, patch:Partial<Loan>)=>setInput(prev=>({...prev,loans:prev.loans.map((l,i)=>i===index?{...l,...patch}:l)}));
  function go(index:number) { setMoved(true); setStep(index); setMessage(''); }
  function reset() {
    setInput(fresh()); setSubmitted(false); setShareUrl(''); setVersion(v=>v+1); go(0);
    if(location.hash.startsWith('#scenario=')) history.replaceState(null,'',location.pathname+location.search);
  }
  async function share() {
    const link = new URL(location.href); link.hash = 'scenario='+encodeURIComponent(JSON.stringify(input));
    try { await navigator.clipboard.writeText(link.href); setMessage('Scenario link copied. Anyone with the link can see these inputs.'); }
    catch { setShareUrl(link.href); }
  }
  const cost = rows.find(r=>r.badges.includes('Lowest total cost'));
  const low = rows.find(r=>r.badges.includes('Lowest monthly'));
  const highlights = [
    ['Lowest monthly','Lowest starting payment'],
    ['Lowest total cost','Lowest modeled total paid'],
    ['Fastest','Fastest projected payoff'],
    ['Best for PSLF','Lowest modeled PSLF payments'],
  ].map(([badge,label])=>({badge,label,winners:rows.filter(row=>row.badges.includes(badge))}))
    .filter(item=>item.winners.length>0);
  return <div class="calculator">
    <div class="wizard card" id="wizard">
    <div class="wizard-top">
      <div class="wizard-intro"><span class="eyebrow">Build your repayment estimate</span><p>Three steps. Use your own figures, or try a sample without entering personal information.</p></div>
      <button type="button" class="secondary wizard-example" onClick={()=>{setInput(sample());setVersion(v=>v+1);setSubmitted(true);setMessage('Example borrower loaded.');requestAnimationFrame(()=>resultHeading.current?.focus());}}>Use example borrower</button>
    </div>
      <nav aria-label="Calculator steps" class="steps">{steps.map((label,i)=><button type="button" key={label} class={step===i?'current':''} aria-current={step===i?'step':undefined} onClick={()=>go(i)}><span>{i+1}</span>{label}</button>)}</nav>
      <form key={version} onSubmit={e=>{e.preventDefault();const firstInvalid=e.currentTarget.querySelector<HTMLInputElement>('[aria-invalid="true"]');if(firstInvalid) {setMessage('Correct the highlighted values before continuing.');firstInvalid.focus();return;}
        if(step===0&&!hasBalance) {setMessage('Enter at least one positive loan balance.');return;}
        if(step<2) go(step+1); else if(!hasBalance || !monthOk(input.start)) {setMessage('Enter a positive loan balance and valid projection start month.');}
        else {setSubmitted(true);setMessage('Comparison updated.');requestAnimationFrame(()=>resultHeading.current?.focus());}}}>
        <p class="wizard-step-caption"><strong>Step {step+1} of {steps.length}</strong><span aria-hidden="true"> · </span>{stepHints[step]}</p>
        <h2 ref={heading} tabIndex={-1}>{['Add your loans','Describe your household','Set your repayment goals'][step]}</h2>
        {step===0 && <>
          <p>Use the balances and fixed rates shown in your loan account. <a href={rules.interestRates.source}>Check rates for the current disbursement year</a>.</p>
          {input.loans.map((loan,i)=><fieldset key={i} class="loan-row"><legend>Loan {i+1}</legend><div class="fields">
            <NumberField label="Current balance" prefix="$" value={loan.balance} onChange={balance=>updateLoan(i,{balance})}/>
            <NumberField label="Annual interest rate" suffix="%" value={loan.rate*100} max={100} onChange={rate=>updateLoan(i,{rate:rate/100})}/>
            <Field label="Loan type"><select value={loan.type} onChange={e=>updateLoan(i,{type:e.currentTarget.value as LoanType})}>{Object.entries(labels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></Field>
          </div>{input.loans.length>1 && <button type="button" class="text-button" onClick={()=>{setVersion(v=>v+1);update('loans',input.loans.filter((_,ix)=>ix!==i));}}>Remove loan {i+1}</button>}</fieldset>)}
          {input.loans.length<30 && <button type="button" class="secondary" onClick={()=>update('loans',[...input.loans,{balance:0,rate:0,type:'unsubsidized'}])}>+ Add another loan</button>}
          <Field label="Federal borrowing history"><select value={input.vintage} onChange={e=>update('vintage',e.currentTarget.value as Inputs['vintage'])}>
            <option value="unknown">Choose the description that fits</option>
            <option value="old">Prior Direct or FFEL balance at the July 2014 cutoff, still in the older IBR group</option>
            <option value="new-ibr">New borrower for IBR from July 2014, all Direct loans before July 2026</option>
            <option value="new-direct">Any Direct Loan made on or after July 1, 2026</option></select></Field>
        </>}
        {step===1 && <><p>Adjusted gross income is the amount reported on your tax return.</p><div class="fields">
          <NumberField label={input.filing==='joint'?'Your share of joint AGI':'Your adjusted gross income'} prefix="$" value={input.income} onChange={n=>update('income',n)}/>
          <Field label="Tax filing status"><select value={input.filing} onChange={e=>update('filing',e.currentTarget.value as Inputs['filing'])}><option value="single">Unmarried</option><option value="joint">Married filing jointly</option><option value="separate">Married filing separately</option></select></Field>
          <NumberField label="Dependents claimed on your return" value={input.dependents} max={30} integer onChange={n=>update('dependents',n)}/>
          <NumberField label="Other qualifying IBR family members" value={input.otherFamily} max={30} integer onChange={n=>update('otherFamily',n)}/>
          <Field label="Poverty guideline region"><select value={input.region} onChange={e=>update('region',e.currentTarget.value as Inputs['region'])}><option value="contiguous">48 contiguous states and DC</option><option value="AK">Alaska</option><option value="HI">Hawaii</option></select></Field>
          {input.filing==='joint' && <><NumberField label="Spouse’s share of joint AGI" prefix="$" value={input.spouseIncome} onChange={n=>update('spouseIncome',n)}/><NumberField label="Spouse’s eligible student loan balance" prefix="$" value={input.spouseBalance} onChange={n=>update('spouseBalance',n)}/></>}
        </div></>}
        {step===2 && <><p>Choose a projection start and include any already confirmed payment credit.</p>
          <label class="check"><input type="checkbox" checked={input.pslf} onChange={e=>update('pslf',e.currentTarget.checked)}/> I expect to keep working for a PSLF-eligible employer</label>
          {input.pslf && <NumberField label="Certified PSLF payments shared by these loans" max={rules.pslfMonths.value} integer value={input.certified} onChange={n=>update('certified',n)}/>}
          <details open><summary>Assumptions you can edit</summary><div class="fields">
            <Field label="First projected payment month"><input type="month" min="2000-01" max="2099-12" required value={input.start} onChange={e=>{if(monthOk(e.currentTarget.value))update('start',e.currentTarget.value);}}/></Field>
            <NumberField label="Expected annual AGI growth" suffix="%" value={input.growth*100} min={-99} max={100} onChange={n=>update('growth',n/100)}/>
            <NumberField label="Debt at entry to repayment (0 uses current debt)" prefix="$" value={input.initialDebt} onChange={n=>update('initialDebt',n)}/>
            <NumberField label="Existing IBR cap (0 estimates it)" prefix="$" value={input.ibrCap} onChange={n=>update('ibrCap',n)}/>
            <NumberField label="Previously used IBR subsidy months" integer max={rules.ibrInterestSubsidyMonths.value} value={input.ibrSubsidyUsed} onChange={n=>update('ibrSubsidyUsed',n)}/>
            <NumberField label="Confirmed eligible IBR months" integer max={rules.ibrOld.value.months} value={input.ibrMonthsAlready} onChange={n=>update('ibrMonthsAlready',n)}/>
            <NumberField label="Confirmed eligible RAP months" integer max={rules.rapMonths.value} value={input.rapMonthsAlready} onChange={n=>update('rapMonthsAlready',n)}/>
          </div><p>Estimates assume on-time monthly payments and stable family circumstances. Taxes are excluded.</p></details>
        </>}
        <p class="notice-line" role="status">{message}</p>
        <div class="actions">{step>0 && <button type="button" class="secondary" onClick={()=>go(step-1)}>Back</button>}<button type="submit" class="primary">{step===2?'Compare repayment plans':'Continue'}</button><button type="button" class="text-button" onClick={reset}>Reset</button></div>
      </form>
    </div>
    <section class="results" id="results" aria-labelledby="results-title">
      <div class="results-head"><div><span class="eyebrow">Your estimates</span><h2 id="results-title" ref={resultHeading} tabIndex={-1}>Compare your options</h2></div><span class="stamp">Rules last verified: <time>{rules.rapBands.retrieved}</time></span></div>
      <div class="notice" aria-live="polite">{!submitted ? 'Complete the calculator or load an example to compare starting payments, lifetime costs and payoff dates.'
        : !rows.length ? <>This scenario needs an eligibility check or a positive loan balance. Choose your borrowing history and review the <a href="/tools/parent-plus-consolidation-checker/">Parent PLUS checker</a> or <a href="/deadlines/">transition guidance</a> if applicable.</>
          : <>{low?.title} has the lowest starting payment ({money(low?.starting ?? 0)}). {cost?.title} has the lowest projected out-of-pocket payments ({money(cost?.paid ?? 0)}) before any forgiveness tax.</>}</div>
      {rows.length>0 && <>
      <p class="results-update-hint">Estimates update automatically if you change the inputs above. They are not official plan quotes.</p>
      <section class="best-plans" aria-labelledby="best-plans-title">
        <h3 id="best-plans-title">Highlights from these modeled estimates</h3>
        <ul>{highlights.map(({badge,label,winners}) =>
          <li key={badge}><strong>{label}</strong><span>{winners.map(row=>row.title).join(' / ')}</span></li>
        )}</ul>
      </section>
      <p class="muted">Educational estimates only. These highlights compare the scenarios entered, not your eligibility or which plan you should choose. Verify choices with Federal Student Aid and your servicer.</p>
      {alerts.length>0 && <section class="assumptions" aria-label="Unverified projection assumptions">
        <p>Planning estimate. {alerts.length} {alerts.length === 1 ? 'assumption applies' : 'assumptions apply'}.</p>
        <details><summary>See assumptions <span class="muted">(unverified)</span></summary>
          <ul>{alerts.map(key => <li key={key}>{key === 'ibrRounding' ? 'Your servicer may round small IBR payments differently.' : rules[key].note}</li>)}</ul>
        </details>
      </section>}
        <div class="result-grid">{rows.map((row,i)=><article key={row.plan} class="plan card" style={{'--series':colors[i]}}>
          <h3>{row.title}</h3><p class="amount">{money(row.starting)} <small>/ month to start</small></p>
          <dl><div><dt>Total you pay</dt><dd>{money(row.paid)}</dd></div><div><dt>Interest you pay</dt><dd>{money(row.interest)}</dd></div><div><dt>Estimated forgiveness</dt><dd>{money(row.forgiven)}</dd></div><div><dt>{row.outcome==='paid'?'Estimated payoff':row.outcome==='pslf'?'Estimated PSLF':'Estimated IDR forgiveness'}</dt><dd>{dateLabel(row.end)}</dd></div>
          {row.pslfSavings!==null && <div><dt>Modeled PSLF payment difference</dt><dd>{money(row.pslfSavings)}</dd></div>}</dl>
        </article>)}</div>
        <div class="chart-grid"><Chart rows={rows} metric="balance"/><Chart rows={rows} metric="payment"/></div>
        <div class="actions no-print"><button type="button" class="secondary" onClick={share}>Copy scenario link</button><button type="button" class="secondary" onClick={()=>window.print()}>Print or save as PDF</button><button type="button" class="text-button" onClick={()=>{go(2);requestAnimationFrame(()=>heading.current?.focus());}}>Edit assumptions</button></div>
        {shareUrl && <label class="field no-print">Copy scenario link<input readOnly value={shareUrl} onFocus={e=>e.currentTarget.select()}/></label>}
        <p class="muted" role="status">{message.startsWith('Scenario link copied')?message:'Only share a scenario link with someone you want to see these figures.'}</p>
      </>}
    </section>
  </div>;
}
