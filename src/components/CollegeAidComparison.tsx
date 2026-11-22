import { useState } from 'preact/hooks';
import { aidOfferIssue, calculateAidOffer, parseAidAmount } from '../lib/college-aid';
import { formatUSD } from '../lib/engine';

const schools = ['School A', 'School B'] as const;
const fields = [
  ['cost', 'Annual cost of attendance'],
  ['grants', 'Grants'],
  ['scholarships', 'Scholarships'],
  ['loans', 'Loans you plan to accept'],
] as const;

const fieldExplanations: Record<'cost' | 'grants' | 'scholarships' | 'loans', string> = {
  cost:'The full estimated annual cost, including tuition, fees and living expenses—not just tuition.',
  grants:'Financial aid that generally does not need to be repaid if you meet its conditions.',
  scholarships:'Scholarship funding that generally does not need to be repaid; check renewal rules.',
  loans:'Only the amount you plan to borrow. This is debt, not a price reduction.',
};

type Field = typeof fields[number][0];
type Offer = Record<Field, string>;
type Results = Array<ReturnType<typeof calculateAidOffer>>;
const emptyOffer: Offer = { cost: '', grants: '', scholarships: '', loans: '' };
const examples: Offer[] = [
  { cost: '30,000', grants: '7,000', scholarships: '5,000', loans: '5,500' },
  { cost: '36,000', grants: '8,000', scholarships: '11,000', loans: '4,000' },
];

function compare(offers: Offer[]) {
  const errors: Record<string, string> = {};
  const results = offers.map((offer, index) => {
    const amounts = fields.map(([field]) => {
      const amount = parseAidAmount(offer[field], field !== 'cost');
      if (amount === null) {
        errors[`aid-${index}-${field}`] = 'Enter a nonnegative U.S. dollar amount with up to two decimal places.';
      }
      return amount ?? 0;
    });
    if (!fields.some(([field]) => errors[`aid-${index}-${field}`])) {
      const issue = aidOfferIssue(amounts[0], amounts[1], amounts[2], amounts[3]);
      if (issue === 'gift-aid-exceeds-cost') {
        errors[`aid-${index}-scholarships`] = 'Grants and scholarships together exceed the annual cost. Check the amounts in the award letter.';
      }
      if (issue === 'planned-loans-exceed-net-price') {
        errors[`aid-${index}-loans`] = 'Planned loans exceed the cost remaining after grants and scholarships. Verify the award letter and borrowing amount.';
      }
    }
    return calculateAidOffer(amounts[0], amounts[1], amounts[2], amounts[3]);
  });
  return { errors, results: Object.keys(errors).length ? null : results };
}

function interpretOffers(results:Results, names:string[]) {
  const [first,second]=results;
  const comparisons = [
    ['annual net price','netPrice'],
    ['remaining gap after planned loans','gapAfterLoans'],
    ['planned borrowing','borrowed'],
  ] as const;
  return comparisons.map(([description,key]) => {
    const a=first[key],b=second[key];
    if (a===b) return {key,description,text:'The two schools are equal on this measure.'};
    const lower=names[a<b?0:1].trim() || schools[a<b?0:1];
    return {key,description,text:lower+' has '+formatUSD(Math.abs(a-b)/100)+' less '+description+' in this one-year example.'};
  });
}

export default function CollegeAidComparison() {
  const [offers, setOffers] = useState<Offer[]>([emptyOffer, emptyOffer]);
  const [schoolNames, setSchoolNames] = useState<string[]>(['','']);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Results | null>(null);
  const insights=results ? interpretOffers(results,schoolNames) : [];

  function calculate(values: Offer[]) {
    const next = compare(values);
    setErrors(next.errors);
    setResults(next.results);
    const firstError = Object.keys(next.errors)[0];
    if (firstError) requestAnimationFrame(() => document.getElementById(firstError)?.focus());
  }

  return <>
    <form class="tool-pane card" noValidate onSubmit={event => {
      event.preventDefault();
      calculate(offers);
    }} onReset={event => {
      event.preventDefault();
      setOffers([emptyOffer, emptyOffer]);
      setSchoolNames(['','']);
      setResults(null);
      setErrors({});
    }}>
      <p id="aid-input-help">Use the same academic year for both schools. Enter total annual costs; list grants and scholarships separately from any loans you plan to accept. Leave an optional amount blank to count it as zero.</p>
      <div class="result-grid">
        {schools.map((school, index) => <fieldset class="loan-row" key={school}>
          <legend>{school}</legend>
          <div class="tool-pane">
            <label class="field aid-school-name" for={`aid-school-name-${index}`}>
              <span>School name <span class="field-optional">(optional)</span></span>
              <input id={`aid-school-name-${index}`} type="text" maxLength={70} placeholder="e.g., North Valley University"
                value={schoolNames[index]} onInput={event=>setSchoolNames(current=>current.map((name,i)=>i===index?event.currentTarget.value:name))}/>
            </label>
            {fields.map(([field, label]) => {
              const id = `aid-${index}-${field}`;
              return <label class="field" key={field} for={id}><span>{label} (USD)</span>
                <input id={id} type="text" inputMode="decimal" value={offers[index][field]}
                  required={field === 'cost'}
                  aria-invalid={errors[id] ? 'true' : undefined}
                  aria-describedby={`${id}-hint ${errors[id] ? `${id}-error` : 'aid-input-help'}`}
                  onInput={event => {
                    const value = event.currentTarget.value;
                    setOffers(current => current.map((offer, position) => position === index ? { ...offer, [field]: value } : offer));
                    setResults(null);
                    if (errors[id]) setErrors(current => {
                      const next = { ...current };
                      delete next[id];
                      return next;
                    });
                  }} />
                <small id={`${id}-hint`} class="aid-field-hint">{fieldExplanations[field]}</small>
                {errors[id] && <small id={`${id}-error`}>{errors[id]}</small>}
              </label>;
            })}
          </div>
        </fieldset>)}
      </div>
      {Object.keys(errors).length > 0 && <p class="warning" role="alert">Check the highlighted amounts before comparing.</p>}
      <div class="actions">
        <button class="primary" type="submit">Compare offers</button>
        <button class="secondary" type="button" onClick={() => {
          setOffers(examples);
          calculate(examples);
        }}>Use example offers</button>
        <button class="secondary" type="button" onClick={() => {
          setOffers([offers[1],offers[0]]);
          setSchoolNames([schoolNames[1],schoolNames[0]]);
          setResults(null);
          setErrors({});
        }}>Swap schools</button>
        <button class="text-button" type="reset">Reset</button>
      </div>
    </form>
    <section class="support" aria-labelledby="aid-results-heading">
      <h2 id="aid-results-heading">Annual cost comparison</h2>
      <div aria-live="polite">
        {results ? <div class="result-grid">
          {results.map((offer, index) => <section class="tool-pane card" aria-labelledby={`aid-result-${index}`} key={schools[index]}>
            <h3 id={`aid-result-${index}`}>{schoolNames[index].trim() || schools[index]}</h3>
            <dl>
              <div><dt>Net price</dt><dd>{formatUSD(offer.netPrice / 100)}</dd></div>
              <div><dt>Remaining before loans</dt><dd>{formatUSD(offer.gapBeforeLoans / 100)}</dd></div>
              <div><dt>Loans to repay</dt><dd>{formatUSD(offer.borrowed / 100)}</dd></div>
              <div><dt>Remaining after loans</dt><dd>{formatUSD(offer.gapAfterLoans / 100)}</dd></div>
            </dl>
          </section>)}
        </div> : <p>Compare two offers to see what you may have left to cover.</p>}
        {results && <section class="aid-insights card" aria-labelledby="aid-insights-heading">
          <span class="eyebrow">What these figures tell you</span>
          <h3 id="aid-insights-heading">The differences that matter</h3>
          <div class="aid-insight-grid">
            {insights.map(insight=><div class="aid-insight" key={insight.key}>
              <strong>{insight.description}</strong>
              <p>{insight.text}</p>
            </div>)}
          </div>
          <p class="aid-insights-note">A smaller gap after borrowing does not necessarily mean a lower price: loans still need to be repaid. These figures are for one academic year and do not include future changes to aid or costs.</p>
          <a href="/guides/compare-college-financial-aid-offers/">Learn how to interpret an aid offer →</a>
        </section>}
      </div>
    </section>
  </>;
}
