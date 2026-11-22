const amountPattern = /^\$?(\d+|\d{1,3}(?:,\d{3})+)(?:\.(\d{1,2}))?$/;

export function parseAidAmount(input: string, optional = false): number | null {
  const trimmed = input.trim();
  if (!trimmed && optional) return 0;
  const match = amountPattern.exec(trimmed);
  if (!match) return null;
  const dollars = Number(match[1].replaceAll(',', ''));
  const cents = dollars * 100 + Number((match[2] ?? '').padEnd(2, '0'));
  return Number.isSafeInteger(cents) ? cents : null;
}

export function calculateAidOffer(cost: number, grants: number, scholarships: number, loans: number) {
  const netPrice = Math.max(0, cost - grants - scholarships);
  return {
    netPrice,
    gapBeforeLoans: netPrice,
    gapAfterLoans: Math.max(0, netPrice - loans),
    borrowed: loans,
  };
}
