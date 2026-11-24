/** Constant-principal illustration; Federal Student Aid uses 365.25 days. */
export function estimateDailyInterest(principal: string, rate: string, days: string) {
  if (![principal, rate, days].every(value => /^\d+(?:\.\d+)?$/.test(value.trim()))) return null;
  const [balance, annualRate, period] = [principal, rate, days].map(Number);
  if (!Number.isFinite(balance) || balance < 0 || balance > 100000000 ||
      !Number.isFinite(annualRate) || annualRate < 0 || annualRate > 100 ||
      !Number.isInteger(period) || period < 0 || period > 3660) return null;
  const daily = balance * (annualRate / 100) / 365.25;
  return { daily, period: daily * period };
}
