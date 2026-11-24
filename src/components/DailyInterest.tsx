import { useState } from 'preact/hooks';
import { estimateDailyInterest } from '../lib/daily-interest';
import { formatUSD } from '../lib/engine';

export default function DailyInterest() {
  const [principal,setPrincipal]=useState('10000');
  const [rate,setRate]=useState('6');
  const [days,setDays]=useState('30');
  const result=estimateDailyInterest(principal,rate,days);
  return <section class="tool-pane card" aria-label="Daily student loan interest calculator">
    <div class="fields">
      <label class="field"><span>Outstanding principal (USD)</span>
        <input type="number" min="0" max="100000000" step="0.01" inputMode="decimal" value={principal} onInput={e=>setPrincipal(e.currentTarget.value)}/>
        <small class="field-hint">Current principal, excluding separately accrued interest.</small>
      </label>
      <label class="field"><span>Annual interest rate (%)</span>
        <input type="number" min="0" max="100" step="any" inputMode="decimal" value={rate} onInput={e=>setRate(e.currentTarget.value)}/>
        <small class="field-hint">For example, enter 6 for a 6% annual rate.</small>
      </label>
      <label class="field"><span>Days without a principal change</span>
        <input type="number" min="0" max="3660" step="1" inputMode="numeric" value={days} onInput={e=>setDays(e.currentTarget.value)}/>
        <small class="field-hint">Enter a whole number from 0 to 3,660.</small>
      </label>
    </div>
    <div class="notice" aria-live="polite">{result ? <dl>
      <div><dt>Estimated daily interest</dt><dd>{formatUSD(result.daily)}</dd></div>
      <div><dt>Estimated interest over the period</dt><dd>{formatUSD(result.period)}</dd></div>
    </dl>:<p>Enter valid values in all three fields.</p>}</div>
    <p>Illustrative estimate only. No payments, subsidies, capitalization, fees or changes to principal are modeled. Check your servicer statement for actual accrued interest.</p>
  </section>;
}
