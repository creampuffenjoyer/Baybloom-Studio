import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, CheckIcon } from "lucide-react";
import { Bloom } from "@/components/brand/logo";

/** Split layout for login/register: form on the left, resort photo on the right. */
export function AuthShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page grid items-center gap-12 py-10 sm:py-14 lg:grid-cols-2 lg:gap-20 lg:py-16">
      <div className="mx-auto w-full max-w-md">
        <Link href="/designs" className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-bay hover:underline"><ArrowLeftIcon aria-hidden className="size-4" /> Back to the collection</Link>
        <h1 className="text-4xl leading-tight font-medium text-balance sm:text-5xl">{title}</h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">{intro}</p>
        <div className="mt-8">{children}</div>
      </div>
      <div className="relative hidden h-full min-h-[620px] overflow-hidden rounded-2xl lg:block">
        <Image
          src="/templates/coral-cove/hero.webp"
          alt="Turquoise lagoon and white-sand beach with a wooden pier under palms"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bay-deep via-bay-deep/15 to-transparent" />
        <div className="absolute right-8 bottom-10 left-8 text-white xl:right-10 xl:left-10">
          <Bloom className="size-9 text-seaglass" />
          <p className="mt-5 max-w-[16ch] font-serif text-4xl leading-tight">Give your place a home online.</p>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-white/85">Explore websites for places to stay and eat, events, wellness businesses, design studios and independent labels.</p>
          <ul className="mt-6 space-y-2 text-sm text-white/90">
            {["Save the designs you love", "Compare tiers and pricing", "Keep your downloads in one place"].map((label) => <li key={label} className="flex items-center gap-2"><CheckIcon aria-hidden className="size-4 text-seaglass" />{label}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
