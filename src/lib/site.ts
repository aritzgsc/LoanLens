export const siteName = import.meta.env.PUBLIC_SITE_NAME?.trim() || 'LoanLens';
// Project attribution, not a claim of professional or individually signed review.
// An editor and private support address must be added only when genuinely available.
export const author = {name:'LoanLens',bio:'Independent educational website maintained through its public GitHub repository. No individual professional reviewer is claimed.'};
export const contact = ''; // No private support inbox is currently published.
// Public AdSense publisher ID. Production can override it with a valid ID.
const publisherOverride = (import.meta.env.PUBLIC_ADSENSE_CLIENT || '').trim();
export const publisher = /^ca-pub-\d+$/.test(publisherOverride) ? publisherOverride : 'ca-pub-8177969374546909';
export const validPublisher = /^ca-pub-\d+$/.test(publisher);
export const partnerOffersEnabled = import.meta.env.PUBLIC_PARTNER_OFFERS === 'true';
export const partnerOfferUrl = import.meta.env.PUBLIC_PARTNER_OFFER_URL || '';
export const publishDrafts = __PUBLISH_DRAFTS__;
export const trustLinks = [
  ['about','About'], ['contact','Contact'], ['editorial-policy','Editorial policy'],
  ['sources','Sources'], ['privacy','Privacy'], ['terms','Terms'], ['disclaimer','Disclaimer'],
  ['accessibility','Accessibility'], ['advertising','Advertising disclosure']
] as const;
export const toolLinks = [
  ['/tools/compare-college-aid-offers/','Compare college aid offers','Compare net price, planned borrowing, and what remains to pay.'],
  ['/tools/student-loan-payoff-calculator/','Student loan payoff calculator','Compare fixed-rate schedules with extra payments.'],
  ['/deadlines/','Repayment deadlines','Find the next date that applies to your loans.'],
  ['/tools/married-rap-impact/','Married RAP payment calculator','Compare separate and joint repayment estimates.'],
  ['/tools/parent-plus-consolidation-checker/','Parent PLUS options','Check how consolidation timing can affect eligibility.'],
  ['/tools/pslf-payment-tracker/','PSLF payment tracker','Estimate when you could reach the payment requirement.'],
  ['/rap-payment-by-income/','RAP payment calculator by income','Estimate a starting payment and explore income brackets.']
] as const;
export const robotsNoIndex = publishDrafts || !import.meta.env.PUBLIC_SITE_URL || import.meta.env.PUBLIC_SITE_URL.endsWith('.example');
