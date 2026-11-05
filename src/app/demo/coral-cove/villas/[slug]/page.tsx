import type { Metadata } from "next";
import { Suspense } from "react";
import { villas } from "@/templates/coral-cove/content";
import { VillaPage } from "@/templates/coral-cove/pages/villa";

type Props = PageProps<"/demo/coral-cove/villas/[slug]">;

export function generateStaticParams() {
  return villas.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const villa = villas.find((v) => v.slug === slug);
  return villa ? { title: villa.name, description: villa.short } : {};
}

export default function Page({ params }: Props) {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <Villa params={params} />
    </Suspense>
  );
}

async function Villa({ params }: { params: Props["params"] }) {
  const { slug } = await params;
  return <VillaPage slug={slug} />;
}
