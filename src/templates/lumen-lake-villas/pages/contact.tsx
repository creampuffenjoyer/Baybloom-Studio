import Image from "next/image";
import { ExperienceInquiry } from "../components/experience-inquiry";
import { photo } from "../content";
import { site } from "../site";

export function ContactPage() {
  return (
    <div className="mx-auto grid max-w-[1400px] gap-16 px-6 pt-10 sm:px-10 md:grid-cols-2">
      <div>
        <h1 className="font-tpl-display text-7xl sm:text-8xl">Contact</h1>
        <address className="mt-10 text-lg leading-relaxed not-italic">
          {site.address.map((l) => (
            <span key={l} className="block">
              {l}
            </span>
          ))}
        </address>
        <p className="mt-6 text-lg">
          <a href={`mailto:${site.email}`} className="border-b border-tpl-ink">
            {site.email}
          </a>
          <br />
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="text-tpl-muted">
            {site.phone}
          </a>
        </p>
        <div className="mt-12 space-y-4 text-tpl-muted">
          <p>By train: Karlstad, then 35 minutes by car. We can collect you.</p>
          <p>By car: two hours from Oslo, three from Stockholm. Parking by the gate.</p>
        </div>
        <div className="mt-12">
          <p className="font-tpl-display text-3xl">Write to us</p>
          <ExperienceInquiry name="a general question" />
        </div>
      </div>
      <div className="relative min-h-[480px] overflow-hidden">
        <Image src={photo("mist").src} alt={photo("mist").alt} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
      </div>
    </div>
  );
}
