import type { Metadata } from "next";
import { Suspense } from "react";
import { treatments } from "@/templates/still-water-spa/content";
import { TreatmentPage } from "@/templates/still-water-spa/pages/treatment";

type Props = PageProps<"/demo/still-water-spa/treatments/[slug]">;

export function generateStaticParams() {
  return treatments.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = treatments.find((x) => x.slug === slug);
  return item ? { title: item.name, description: item.summary } : {};
}

export default function Page({ params }: Props) {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <Detail params={params} />
    </Suspense>
  );
}

async function Detail({ params }: { params: Props["params"] }) {
  const { slug } = await params;
  return <TreatmentPage slug={slug} />;
}
