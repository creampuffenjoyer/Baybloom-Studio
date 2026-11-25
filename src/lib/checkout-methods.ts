export const STUDIO_PHONE = "+63 966 922 1451";
export const STUDIO_PHONE_HREF = "tel:+639669221451";
export const STUDIO_EMAIL = "baybloom.studios@gmail.com";
export const STUDIO_EMAIL_HREF = `mailto:${STUDIO_EMAIL}`;

export function gcashEligible(totalCents: number, currency: string) {
  return currency.toUpperCase() === "PHP" && totalCents >= 100 && totalCents <= 10_000_000;
}
