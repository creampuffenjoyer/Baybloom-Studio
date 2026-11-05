import type { Metadata } from "next";
import { Suspense } from "react";
import { posts } from "@/templates/isla-verde-boutique/content";
import { PostPage } from "@/templates/isla-verde-boutique/pages/journal";

type Props = PageProps<"/demo/isla-verde-boutique/journal/[slug]">;

export function generateStaticParams() {
  return posts.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = posts.find((x) => x.slug === slug);
  return item ? { title: item.title, description: item.dek } : {};
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
  return <PostPage slug={slug} />;
}
