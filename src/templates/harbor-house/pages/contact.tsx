import Image from "next/image";
import { ContactForm } from "../components/contact-form";
import { photo } from "../content";
import { site } from "../site";

export function ContactPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 pt-10 sm:px-8 md:grid-cols-2">
      <div>
        <h1 className="font-t-display text-5xl sm:text-6xl">Say hello</h1>
        <p className="mt-4 text-lg text-t-muted">
          The quickest way to reach us is a message on WhatsApp or a call. We’re usually in the kitchen.
        </p>
        <p className="mt-8 text-2xl">
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="font-t-display text-t-accent underline underline-offset-4">
            {site.phone}
          </a>
        </p>
        <p className="mt-2">
          <a href={`mailto:${site.email}`} className="underline underline-offset-4">
            {site.email}
          </a>
        </p>
        <address className="mt-8 text-lg not-italic">
          {site.address.map((l) => (
            <span key={l} className="block">
              {l}
            </span>
          ))}
        </address>
        <p className="mt-4 text-t-muted">
          Five minutes from Basco airport. Tell us your flight and we’ll meet you with a sign.
        </p>
        <div className="mt-10 rounded-3xl bg-t-soft p-7">
          <h2 className="font-t-display text-2xl">Or send a message</h2>
          <div className="mt-5">
            <ContactForm />
          </div>
        </div>
      </div>
      <div className="relative min-h-[420px] overflow-hidden rounded-3xl">
        <Image src={photo("harbour-wall").src} alt={photo("harbour-wall").alt} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
      </div>
    </div>
  );
}
