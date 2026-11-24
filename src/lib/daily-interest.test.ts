import { expect, it } from 'vitest';
import { estimateDailyInterest } from './daily-interest';
it('uses the unrounded daily interest for the full period', () => {
  const result = estimateDailyInterest('10000','6','30');
  expect(result?.daily.toFixed(2)).toBe('1.64');
  expect(result?.period.toFixed(2)).toBe('49.28');
});
it('handles zero and fractional rates', () => {
  expect(estimateDailyInterest('10000','0','30')).toEqual({daily:0,period:0});
  expect(estimateDailyInterest('10000','6.5','0')?.period).toBe(0);
});
it('rejects blanks, malformed, negative and out-of-range inputs', () => {
  for (const principal of ['', '-1', '1e3', 'Infinity', '100000001']) expect(estimateDailyInterest(principal,'6','30')).toBeNull();
  expect(estimateDailyInterest('10000','101','30')).toBeNull();
  expect(estimateDailyInterest('10000','6','1.5')).toBeNull();
  expect(estimateDailyInterest('10000','6','3661')).toBeNull();
});
