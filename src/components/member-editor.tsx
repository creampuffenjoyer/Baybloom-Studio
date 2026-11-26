import { Suspense, type ReactNode } from "react";
import { requireEditor } from "@/lib/membership";

async function EditorAccess({slug, children}: {slug: string; children: ReactNode}) {
  await requireEditor(slug);
  return children;
}

export function MemberEditor({slug, children}: {slug: string; children: ReactNode}) {
  return <Suspense fallback={<p role="status" className="p-6">Opening your editor…</p>}>
    <EditorAccess slug={slug}>{children}</EditorAccess>
  </Suspense>;
}
