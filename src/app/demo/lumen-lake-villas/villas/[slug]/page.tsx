import type { Metadata } from "next";
import { Suspense } from "react";
import { villas } from "@/templates/lumen-lake-villas/content";
import { VillaPage } from "@/templates/lumen-lake-villas/pages/villas";

type Props = PageProps<"/demo/lumen-lake-villas/villas/[slug]">;

export function generateStaticParams() {
  return villas.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = villas.find((x) => x.slug === slug);
  return item ? { title: item.name, description: item.line } : {};
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
  return <VillaPage slug={slug} />;
}
