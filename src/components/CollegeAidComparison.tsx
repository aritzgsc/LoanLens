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

export default function CollegeAidComparison() {
  const [offers, setOffers] = useState<Offer[]>([emptyOffer, emptyOffer]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Results | null>(null);

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
      setResults(null);
      setErrors({});
    }}>
      <p id="aid-input-help">Enter amounts for the same academic year. Leave an optional amount blank to count it as zero.</p>
      <div class="result-grid">
        {schools.map((school, index) => <fieldset class="loan-row" key={school}>
          <legend>{school}</legend>
          <div class="tool-pane">
            {fields.map(([field, label]) => {
              const id = `aid-${index}-${field}`;
              return <label class="field" key={field} for={id}><span>{label} (USD)</span>
                <input id={id} type="text" inputMode="decimal" value={offers[index][field]}
                  required={field === 'cost'}
                  aria-invalid={errors[id] ? 'true' : undefined}
                  aria-describedby={errors[id] ? `${id}-error` : 'aid-input-help'}
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
        <button class="text-button" type="reset">Reset</button>
      </div>
    </form>
    <section class="support" aria-labelledby="aid-results-heading">
      <h2 id="aid-results-heading">Annual cost comparison</h2>
      <div aria-live="polite">
        {results ? <div class="result-grid">
          {results.map((offer, index) => <section class="tool-pane card" aria-labelledby={`aid-result-${index}`} key={schools[index]}>
            <h3 id={`aid-result-${index}`}>{schools[index]}</h3>
            <dl>
              <div><dt>Net price</dt><dd>{formatUSD(offer.netPrice / 100)}</dd></div>
              <div><dt>Remaining before loans</dt><dd>{formatUSD(offer.gapBeforeLoans / 100)}</dd></div>
              <div><dt>Loans to repay</dt><dd>{formatUSD(offer.borrowed / 100)}</dd></div>
              <div><dt>Remaining after loans</dt><dd>{formatUSD(offer.gapAfterLoans / 100)}</dd></div>
            </dl>
          </section>)}
        </div> : <p>Compare two offers to see what you may have left to cover.</p>}
      </div>
    </section>
  </>;
}
