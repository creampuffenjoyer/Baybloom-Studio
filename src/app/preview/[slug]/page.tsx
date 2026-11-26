import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TemplatePreview } from "@/components/catalog/template-preview";
import { getTemplatePreview, templatePreviews } from "@/lib/hospitality-previews";

export function generateStaticParams() {
  return Object.keys(templatePreviews).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/preview/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const preview = getTemplatePreview(slug);
  if (!preview) notFound();
  return { title: `Explore ${preview.title}`, robots: { index: false, follow: true } };
}

export default function Page({ params }: PageProps<"/preview/[slug]">) {
  return (
    <Suspense fallback={<p className="p-6" role="status">Loading the preview…</p>}>
      <PreviewContent params={params} />
    </Suspense>
  );
}

async function PreviewContent({ params }: Pick<PageProps<"/preview/[slug]">, "params">) {
  const { slug } = await params;
  const preview = getTemplatePreview(slug);
  if (!preview) notFound();
  const catalogPreview = true;

  return <TemplatePreview slug={slug} title={preview.title} base={`/demo/${slug}`} pages={preview.pages} eventPrefix={`${slug}-preview`} languages={["en"]} catalogPreview={catalogPreview} />;
}
