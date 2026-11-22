import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, children, action }: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  action: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-white px-6 py-14 text-center sm:py-20">
      <span className="grid size-14 place-items-center rounded-full bg-secondary text-bay">
        <Icon aria-hidden className="size-6" strokeWidth={1.5} />
      </span>
      <h2 className="mt-6 text-2xl font-medium sm:text-3xl">{title}</h2>
      <div className="mt-3 max-w-sm text-base leading-relaxed text-muted-foreground">{children}</div>
      <div className="mt-7 flex flex-wrap justify-center gap-3">{action}</div>
    </div>
  );
}
