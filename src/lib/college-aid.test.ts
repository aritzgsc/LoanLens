import { expect, it } from 'vitest';
import { aidOfferIssue, calculateAidOffer, parseAidAmount } from './college-aid';

it('parses U.S. currency in cents and treats a blank optional award as zero', () => {
  expect(parseAidAmount(' $12,345.67 ')).toBe(1234567);
  expect(parseAidAmount('10.5')).toBe(1050);
  expect(parseAidAmount('')).toBeNull();
  expect(parseAidAmount('', true)).toBe(0);
  expect(parseAidAmount('0')).toBe(0);
});

it('rejects negative, malformed, fractional-cent, and unsafe amounts', () => {
  for (const amount of ['-100', '1,23', '1.234', '1e4', 'Infinity', '99999999999999999999']) {
    expect(parseAidAmount(amount)).toBeNull();
  }
});

it('keeps annual net price separate from the gap after planned borrowing', () => {
  expect(calculateAidOffer(3000000, 700000, 500000, 550000)).toEqual({
    netPrice: 1800000,
    gapBeforeLoans: 1800000,
    gapAfterLoans: 1250000,
    borrowed: 550000,
  });
});

it('floors the uncovered amount at zero even when aid exceeds cost', () => {
  expect(calculateAidOffer(10, 8, 5, 0).netPrice).toBe(0);
  expect(calculateAidOffer(10, 1, 1, 12).gapAfterLoans).toBe(0);
});

it('flags mathematically inconsistent offers instead of silently presenting a misleading result', () => {
  expect(aidOfferIssue(3000000, 3100000, 0, 0)).toBe('gift-aid-exceeds-cost');
  expect(aidOfferIssue(3000000, 700000, 500000, 2000000)).toBe('planned-loans-exceed-net-price');
  expect(aidOfferIssue(3000000, 700000, 500000, 1800000)).toBeNull();
  expect(aidOfferIssue(3000000, 700000, 500000, 550000)).toBeNull();
});

it('keeps cents exact when the annual aid offer contains decimals', () => {
  const cost = parseAidAmount('27,451.25');
  const grants = parseAidAmount('5,123.40');
  const scholarships = parseAidAmount('2,000.05');
  const loans = parseAidAmount('4,500');
  expect([cost,grants,scholarships,loans].every(amount => amount !== null)).toBe(true);
  if (cost === null || grants === null || scholarships === null || loans === null) return;
  expect(calculateAidOffer(cost, grants, scholarships, loans)).toEqual({
    netPrice: 2032780,
    gapBeforeLoans: 2032780,
    gapAfterLoans: 1582780,
    borrowed: 450000,
  });
});
