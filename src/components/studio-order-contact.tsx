import { STUDIO_EMAIL, STUDIO_EMAIL_HREF, STUDIO_PHONE, STUDIO_PHONE_HREF } from "@/lib/checkout-methods";

export function StudioOrderContact() {
  return (
    <div className="mt-4 border-t border-border pt-3 text-center">
      <p className="text-sm font-medium text-ink">Discuss a custom order</p>
      <div className="flex flex-wrap justify-center gap-x-4 text-sm font-medium text-bay">
        <a className="inline-flex min-h-11 items-center underline" href={STUDIO_PHONE_HREF}>Call {STUDIO_PHONE}</a>
        <a className="flex min-h-11 min-w-0 items-center underline [overflow-wrap:anywhere]" href={STUDIO_EMAIL_HREF}>{STUDIO_EMAIL}</a>
      </div>
    </div>
  );
}
