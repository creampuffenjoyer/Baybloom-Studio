import type { Metadata } from "next";
import { Suspense } from "react";
import { spaces } from "@/templates/bloomfield-gardens/content";
import { SpacePage } from "@/templates/bloomfield-gardens/pages/space";

type Props = PageProps<"/demo/bloomfield-gardens/spaces/[slug]">;

export function generateStaticParams() {
  return spaces.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = spaces.find((x) => x.slug === slug);
  return item ? { title: item.name, description: item.short } : {};
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
  return <SpacePage slug={slug} />;
}
