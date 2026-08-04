/**
 * White-label configuration. Change these values to re-brand the platform
 * (app name, contact details, currency, delivery fees, tax) without touching
 * any component code.
 */
export const brand = {
  name: "Slider",
  tagline: "Hot food, slid to your door.",
  supportEmail: "support@slider.food",
  supportPhone: "+91 80 4567 8900",
  currency: "₹",
  deliveryFee: 39,
  freeDeliveryAbove: 599,
  taxRate: 0.05,
} as const;

export const formatMoney = (amount: number) =>
  `${brand.currency}${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;