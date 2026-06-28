export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(Number(value) * 100) / 100;
}

export function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
