import Image from "next/image";
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
    <div className="container-page grid min-h-[calc(100dvh-4rem)] items-center gap-10 py-12 lg:grid-cols-2 lg:py-16">
      <div className="mx-auto w-full max-w-md">
        <Bloom className="size-8 text-hibiscus" />
        <h1 className="mt-5 text-4xl font-medium text-balance">{title}</h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">{intro}</p>
        <div className="mt-8">{children}</div>
      </div>
      <div className="relative hidden h-full min-h-[560px] overflow-hidden rounded-3xl lg:block">
        <Image
          src="/images/designs/coral-cove/02-curved-resort-pool-with-sun-loungers.webp"
          alt="Curved resort pool with sun loungers overlooking the sea"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bay-deep/70 via-transparent to-transparent" />
        <p className="absolute right-8 bottom-8 left-8 font-serif text-2xl leading-snug text-white">
          “Your guests deserve a beautiful website.”
        </p>
      </div>
    </div>
  );
}
