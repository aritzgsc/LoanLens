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

// Check internally consistent annual aid figures before producing a potentially misleading comparison.
// Amounts are integer cents, as returned by parseAidAmount.
export function aidOfferIssue(cost: number, grants: number, scholarships: number, loans: number):
  'gift-aid-exceeds-cost' | 'planned-loans-exceed-net-price' | null {
  if (grants + scholarships > cost) return 'gift-aid-exceeds-cost';
  if (loans > cost - grants - scholarships) return 'planned-loans-exceed-net-price';
  return null;
}
