export const siteName = import.meta.env.PUBLIC_SITE_NAME?.trim() || 'LoanLens';
export const author = {name:'{{AUTHOR_NAME}}',bio:'{{AUTHOR_BIO}}'};
export const contact = '{{CONTACT_EMAIL}}';
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
  ['/deadlines/','Repayment deadlines','Find the next date that applies to your loans.'],
  ['/tools/married-rap-impact/','Married RAP impact','Compare separate and joint repayment estimates.'],
  ['/tools/parent-plus-consolidation-checker/','Parent PLUS options','Check how consolidation timing can affect eligibility.'],
  ['/tools/pslf-payment-tracker/','PSLF payment tracker','Estimate when you could reach the payment requirement.'],
  ['/rap-payment-by-income/','RAP payments by income','Explore payment ranges by income and dependents.']
] as const;
export const robotsNoIndex = publishDrafts || !import.meta.env.PUBLIC_SITE_URL || import.meta.env.PUBLIC_SITE_URL.endsWith('.example');
