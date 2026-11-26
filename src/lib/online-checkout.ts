import "server-only";

export function onlineCheckoutEnabled() {
  return process.env.ONLINE_CHECKOUT_ENABLED === "true";
}
