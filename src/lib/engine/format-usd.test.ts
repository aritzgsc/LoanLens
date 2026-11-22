import { expect, it } from 'vitest';
import { compare, example, formatUSD, rules } from './index';

it('shows cents in payment amounts and can group whole-dollar brackets', () => {
  expect(formatUSD(175.5)).toBe('$175.50');
  expect(formatUSD(387.5)).toBe('$387.50');
  expect(formatUSD(45000)).toBe('$45,000.00');
  expect(formatUSD(45000, 'whole')).toBe('$45,000');
});

it('distinguishes paying off a loan from reaching PSLF first', () => {
  const rows = compare({ ...example, pslf: true, certified: rules.pslfMonths.value - 1 });
  expect(rows.some(row => row.outcome === 'pslf')).toBe(true);
  expect(rows.some(row => row.outcome === 'pslf' && row.badges.includes('Fastest'))).toBe(false);
});
