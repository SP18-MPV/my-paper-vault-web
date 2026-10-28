// Prices come from the API in kobo (1 naira = 100 kobo) — the backend stores
// them that way and Flutterwave charges in NGN.
const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export const formatNaira = (kobo: number) => nairaFormatter.format(kobo / 100);
