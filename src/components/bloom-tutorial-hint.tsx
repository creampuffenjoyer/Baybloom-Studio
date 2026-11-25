"use client";

import "./bloom-spotlight.css";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { XIcon } from "lucide-react";
import { followBloomTarget } from "./bloom-callout";

gsap.registerPlugin(useGSAP);

export function BloomTutorialHint({ title, children, target, compactTarget, preferAbove, onExit, onTargetChange, actions, fallback }: {
  title: string;
  children: ReactNode;
  target?: string;
  compactTarget?: string;
  preferAbove?: boolean;
  onExit: () => void;
  onTargetChange?: () => void;
  actions?: ReactNode;
  fallback?: ReactNode;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [targetFound, setTargetFound] = useState(false);

  useLayoutEffect(() => {
    const bubble = card.current;
    const outline = ring.current;
    if (!bubble || !outline) return;
    let anchor: HTMLElement | null | undefined;
    let frame = 0;
    let stopFollowing: (() => void) | undefined;
    const desktop = compactTarget ? window.matchMedia("(min-width: 64rem)") : null;

    function resolve() {
      const targetName = desktop?.matches === false ? compactTarget : target;
      const next = targetName ? document.querySelector<HTMLElement>(`[data-bloom-target="${targetName}"]`) : null;
      if (next === anchor) return;
      anchor = next;
      stopFollowing?.();
      next?.scrollIntoView({ block: "center", behavior: "instant" });
      stopFollowing = followBloomTarget(bubble!, outline!, next, { preferAbove });
      setTargetFound(!!next);
    }

    // Pricing streams in after the product page. Reattach if a target mounts or remounts.
    const observer = new MutationObserver(() => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        resolve();
      });
    });
    if (target) observer.observe(document.body, { childList: true, subtree: true });
    desktop?.addEventListener("change", resolve);
    resolve();
    bubble.focus({ preventScroll: true });

    return () => {
      observer.disconnect();
      desktop?.removeEventListener("change", resolve);
      cancelAnimationFrame(frame);
      stopFollowing?.();
    };
  }, [target, compactTarget, preferAbove]);

  useLayoutEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key !== "Escape" || document.querySelector('[aria-modal="true"], [role="dialog"][data-state="open"]')) return;
      event.preventDefault();
      onExit();
    }
    function handleChange(event: Event) {
      if (event.target instanceof HTMLElement && event.target.dataset.bloomTarget === target) onTargetChange?.();
    }
    function forwardFrameKeys(event: Event) {
      if (event.target instanceof HTMLIFrameElement && event.target.hasAttribute("data-bloom-sample-frame")) {
        event.target.contentDocument?.addEventListener("keydown", handleKey, { signal: listeners.signal });
      }
    }

    const listeners = new AbortController();
    const options = { capture: true, signal: listeners.signal };
    window.addEventListener("keydown", handleKey, options);
    window.addEventListener("change", handleChange, options);
    document.addEventListener("load", forwardFrameKeys, options);
    document.querySelector<HTMLIFrameElement>("iframe[data-bloom-sample-frame]")?.contentDocument?.addEventListener("keydown", handleKey, options);
    return () => listeners.abort();
  }, [onExit, onTargetChange, target]);

  useGSAP(() => {
    const media = gsap.matchMedia(root.current ?? undefined);
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.timeline({ defaults: { duration: 0.24, ease: "power2.out" } })
        .from(".bloom-spotlight-ring", { opacity: 0 }, 0)
        .from(".bloom-spotlight-card", { opacity: 0.65, y: 5 }, 0)
        .from(".bloom-spotlight-character", { rotation: -7, scale: 0.9, ease: "back.out(1.6)" }, 0.03);
    });
    return () => media.revert();
  }, { scope: root, dependencies: [title, target], revertOnUpdate: true });

  return (
    <div ref={root} className="bloom-spotlight bloom-spotlight-unlocked">
      <div ref={ring} className="bloom-spotlight-ring" aria-hidden="true" hidden />
      <section ref={card} className="bloom-spotlight-card" tabIndex={-1} role="region" aria-labelledby={id}>
        <div className="bloom-spotlight-character bloom-avatar" aria-hidden="true" />
        <div className="bloom-spotlight-copy">
          <h2 id={id}>{title}</h2>
          {children}
        </div>
        <div className="bloom-tutorial-actions">
          {actions}
          {!targetFound && fallback}
          <button type="button" className="bloom-action bloom-secondary" onClick={onExit}><XIcon aria-hidden="true" /> Exit tour</button>
        </div>
      </section>
    </div>
  );
}
