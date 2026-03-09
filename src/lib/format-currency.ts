export function formatCurrency(amount: number, currency = "EGP", locale = "en-EG") {
  return amount.toLocaleString(locale, {
    style: "currency",
    currency,
  });
}
