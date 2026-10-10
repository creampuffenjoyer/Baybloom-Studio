"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "motion/react";
import { HeartIcon } from "lucide-react";
import { toast } from "sonner";
import { setFavoriteAction } from "@/app/actions/favorites";
import { loginHref } from "@/lib/urls";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  designId,
  title,
  initial = false,
  signedIn,
  className,
  onChange,
}: {
  designId: string;
  title: string;
  initial?: boolean;
  signedIn: boolean;
  className?: string;
  onChange?: (favorite: boolean) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useState(initial);
  const [optimistic, setOptimistic] = useOptimistic(saved);
  const [, startTransition] = useTransition();
  const [popKey, setPopKey] = useState(0);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!signedIn) {
      toast("Log in to save favorites", {
        action: { label: "Log in", onClick: () => router.push(loginHref(pathname)) },
      });
      return;
    }
    const next = !optimistic;
    if (next) setPopKey((k) => k + 1);
    startTransition(async () => {
      setOptimistic(next);
      const res = await setFavoriteAction(designId, next);
      if (!res.ok) {
        toast.error(
          res.reason === "signed-out" ? "Your session expired. Please log in again." : "Couldn't update favorites.",
        );
        return;
      }
      setSaved(res.favorite);
      onChange?.(res.favorite);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={optimistic}
      aria-label={optimistic ? `Remove ${title} from favorites` : `Save ${title} to favorites`}
      className={cn(
        "grid size-10 place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
    >
      <motion.span
        key={popKey}
        initial={popKey ? { scale: 0.6 } : false}
        animate={{ scale: [0.6, 1.25, 1] }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="grid place-items-center"
      >
        <HeartIcon
          className={cn(
            "size-[18px] transition-colors",
            optimistic ? "fill-hibiscus text-hibiscus" : "text-ink/70",
          )}
        />
      </motion.span>
    </button>
  );
}
