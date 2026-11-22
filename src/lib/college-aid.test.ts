import { expect, it } from 'vitest';
import { calculateAidOffer, parseAidAmount } from './college-aid';

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
