export function formatCurrency(amount: number, currency = "EGP", locale = "ar-EG") {
  // If in browser, try to get browser locale
  let finalLocale = locale;
  if (typeof window !== "undefined") {
    const nav = window.navigator as any;
    finalLocale = nav.language || nav.browserLanguage || nav.systemLanguage || nav.userLanguage || locale;
  }

  return amount.toLocaleString(finalLocale, {
    style: "currency",
    currency,
  });
}
