import type { ReactNode } from "react";

export function PageHeading({ eyebrow, title, children, action }: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-8 sm:pb-10">
      <div className="max-w-3xl">
        {eyebrow && <p className="mb-3 text-sm font-medium text-hibiscus-strong">{eyebrow}</p>}
        <h1 className="text-4xl leading-[1.12] font-medium sm:text-5xl">{title}</h1>
        {children && <div className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{children}</div>}
      </div>
      {action}
    </div>
  );
}
