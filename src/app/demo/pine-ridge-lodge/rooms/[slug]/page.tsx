import type { Metadata } from "next";
import { Suspense } from "react";
import { rooms } from "@/templates/pine-ridge-lodge/content";
import { RoomPage } from "@/templates/pine-ridge-lodge/pages/rooms";

type Props = PageProps<"/demo/pine-ridge-lodge/rooms/[slug]">;

export function generateStaticParams() {
  return rooms.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = rooms.find((x) => x.slug === slug);
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
  return <RoomPage slug={slug} />;
}
