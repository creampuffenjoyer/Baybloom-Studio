"use client";

import "./bloom-spotlight.css";
import { followBloomTarget } from "./bloom-callout";
import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ArrowRightIcon, XIcon } from "lucide-react";

gsap.registerPlugin(useGSAP);

export const normalizePreviewName = (text: string) => text.normalize("NFC").replace(/\s+/g, " ").trim();

export function findPreviewName(frame: HTMLIFrameElement, name: string) {
  const doc = frame.contentDocument;
  const brand = doc?.querySelector("[data-preview-brand]");
  if (!brand || !doc) return null;

  // Only the custom wordmark can unlock this step.
  const walker = doc.createTreeWalker(brand, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const element = node.parentElement;
    if (!element || normalizePreviewName(node.textContent ?? "") !== name) continue;
    if (element.closest("script, style, [hidden], [aria-hidden='true']")) continue;
    const range = doc.createRange();
    range.selectNodeContents(node);
    if (range.getBoundingClientRect().width && doc.defaultView?.getComputedStyle(element).visibility === "visible") return range;
  }
  return null;
}

function lockOutside(target: HTMLElement, overlay: HTMLElement) {
  const locked: HTMLElement[] = [];
  for (let child = target; child.parentElement; child = child.parentElement) {
    for (const sibling of child.parentElement.children) {
      if (!(sibling instanceof HTMLElement) || sibling === child || sibling.contains(overlay) || sibling.inert) continue;
      sibling.inert = true;
      locked.push(sibling);
    }
    if (child.parentElement === document.body) break;
  }
  return () => locked.forEach(element => { element.inert = false; });
}

export function BloomSpotlight({ input, frame, onExit, onComplete, onSkip, onReview }: {
  input: HTMLInputElement;
  frame: HTMLIFrameElement;
  onExit: () => void;
  onComplete: () => void;
  onSkip?: () => void;
  onReview: () => void;
}) {
  const titleId = useId();
  const instructionId = useId();
  const [typedName, setTypedName] = useState(() => normalizePreviewName(input.value));
  const [pendingName, setPendingName] = useState("");
  const [timedOut, setTimedOut] = useState(false);
  const [shownName, setShownName] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const hole = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLElement>(null);
  const exit = useRef<HTMLButtonElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const composing = useRef(false);
  const readingPreview = !!shownName;

  const reveal = useCallback(() => {
    const name = normalizePreviewName(input.value);
    if (composing.current || !name) return;
    setTimedOut(false);
    if (findPreviewName(frame, name)) setShownName(name);
    else setPendingName(name);
  }, [frame, input]);

  useLayoutEffect(() => {
    if (readingPreview) return;
    function trackInput() {
      setTypedName(composing.current ? "" : normalizePreviewName(input.value));
      setPendingName("");
      setTimedOut(false);
    }
    function startComposition() {
      composing.current = true;
      trackInput();
    }
    function endComposition() {
      composing.current = false;
      trackInput();
    }
    input.addEventListener("input", trackInput);
    input.addEventListener("compositionstart", startComposition);
    input.addEventListener("compositionend", endComposition);
    return () => {
      input.removeEventListener("input", trackInput);
      input.removeEventListener("compositionstart", startComposition);
      input.removeEventListener("compositionend", endComposition);
    };
  }, [input, readingPreview]);

  useLayoutEffect(() => {
    if (!pendingName || readingPreview) return;
    let observer: MutationObserver | undefined;
    function check() {
      if (normalizePreviewName(input.value) === pendingName && findPreviewName(frame, pendingName)) {
        setShownName(pendingName);
      }
    }
    function observePreview() {
      observer?.disconnect();
      const body = frame.contentDocument?.body;
      if (body) {
        observer = new MutationObserver(check);
        observer.observe(body, { childList: true, characterData: true, attributeFilter: ["data-preview-brand"], subtree: true });
      }
      check();
    }
    frame.addEventListener("load", observePreview);
    observePreview();
    const timeout = window.setTimeout(() => {
      setPendingName("");
      setTimedOut(true);
    }, 5000);
    return () => {
      window.clearTimeout(timeout);
      observer?.disconnect();
      frame.removeEventListener("load", observePreview);
    };
  }, [frame, input, pendingName, readingPreview]);

  useLayoutEffect(() => {
    const overlay = root.current;
    const opening = hole.current;
    const bubble = card.current;
    if (!overlay || !opening || !bubble) return;
    const target = readingPreview ? frame : input;
    const unlock = readingPreview ? undefined : lockOutside(target, overlay);
    const originalDescription = input.getAttribute("aria-describedby");
    if (readingPreview) {
      const nameRect = findPreviewName(frame, shownName)?.getBoundingClientRect();
      if (nameRect && frame.contentWindow) {
        // Bring the name near the top of the iframe so it stays visible on phones.
        frame.contentWindow.scrollTo({ top: frame.contentWindow.scrollY + nameRect.top - 64, behavior: "instant" });
      }
      frame.scrollIntoView({ block: "start", behavior: "instant" });
      bubble.focus({ preventScroll: true });
    } else {
      input.setAttribute("aria-describedby", [originalDescription, instructionId].filter(Boolean).join(" "));
      input.scrollIntoView({ block: "center", behavior: "instant" });
      input.focus({ preventScroll: true });
    }
    const stopFollowing = followBloomTarget(bubble, opening, target, { getRect: () => {
      const rect = target.getBoundingClientRect();
      const name = shownName ? findPreviewName(frame, shownName)?.getBoundingClientRect() : undefined;
      if (!name) return rect;
      const left = Math.max(0, name.left);
      const top = Math.max(0, name.top);
      return new DOMRect(rect.left + left, rect.top + top,
        Math.max(0, Math.min(rect.width, name.right) - left),
        Math.max(0, Math.min(rect.height, name.bottom) - top));
    } });

    return () => {
      stopFollowing();
      if (!readingPreview) {
        if (originalDescription === null) input.removeAttribute("aria-describedby");
        else input.setAttribute("aria-describedby", originalDescription);
      }
      unlock?.();
    };
  }, [frame, input, instructionId, readingPreview, shownName]);

  useLayoutEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !composing.current) {
        event.preventDefault();
        event.stopImmediatePropagation();
        onExit();
      } else if (!readingPreview && event.key === "Enter" && document.activeElement === input && !event.isComposing && !composing.current) {
        event.preventDefault();
        if (!pendingName) reveal();
      } else if (!readingPreview && event.key === "Tab") {
        const controls = [input, next.current, exit.current, skip.current].filter(
          (control): control is HTMLInputElement | HTMLButtonElement => !!control && !control.disabled,
        );
        if (!controls.length) return;
        event.preventDefault();
        const active = controls.findIndex(control => control === document.activeElement);
        const index = active === -1 ? 0 : (active + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
        controls[index].focus({ preventScroll: true });
      }
    }
    window.addEventListener("keydown", handleKey, true);
    return () => window.removeEventListener("keydown", handleKey, true);
  }, [input, onExit, pendingName, readingPreview, reveal]);

  useGSAP(() => {
    const media = gsap.matchMedia(root.current ?? undefined);
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.timeline({ defaults: { ease: "power2.out" } })
        .from(".bloom-spotlight-ring", { opacity: 0, duration: 0.24 }, 0)
        .from(".bloom-spotlight-card", { opacity: 0.5, y: 7, duration: 0.23 }, 0.04)
        .from(".bloom-spotlight-character", { rotation: -12, scale: 0.88, duration: 0.4, ease: "back.out(1.7)" }, 0.06);
    });
    return () => media.revert();
  }, { scope: root, dependencies: [readingPreview], revertOnUpdate: true });

  return (
    <div ref={root} className={`bloom-spotlight${readingPreview ? " bloom-spotlight-unlocked" : ""}`}>
      <div ref={hole} className="bloom-spotlight-ring" aria-hidden="true" />
      <section ref={card} className="bloom-spotlight-card" tabIndex={-1}
        role="region" aria-labelledby={titleId}>
        <div className="bloom-spotlight-character bloom-avatar" aria-hidden="true" />
        <div className="bloom-spotlight-copy">
          <h2 id={titleId}>{readingPreview ? "Your name is live in the preview" : "Enter your business name"}</h2>
          <p id={instructionId}>{readingPreview
            ? `This is how “${shownName}” looks on your website preview.`
            : "Type your name, then choose See my name in the preview."}</p>
          {!readingPreview && (pendingName || timedOut) && <p className="bloom-preview-status" role="status">
            {timedOut ? "The preview is taking longer than expected. Try again or edit your name." : "Updating your preview…"}
          </p>}
        </div>
        <div className="bloom-spotlight-actions">
          <button ref={next} type="button" className="bloom-action bloom-primary"
            disabled={!readingPreview && (!typedName || !!pendingName)}
            onClick={readingPreview ? onComplete : reveal}>
            {readingPreview ? (onSkip ? "Keep designing" : "Finish tour") : "See my name in the preview"} <ArrowRightIcon aria-hidden="true" />
          </button>
          <button ref={exit} type="button" className="bloom-action bloom-secondary" onClick={onExit}>
            <XIcon aria-hidden="true" /> Exit tour
          </button>
          {readingPreview
            ? <button type="button" className="bloom-action bloom-secondary bloom-skip" onClick={onReview}>Review design and ordering</button>
            : onSkip && <button ref={skip} type="button" className="bloom-action bloom-secondary bloom-skip" onClick={onSkip}>Skip step</button>}
        </div>
      </section>
    </div>
  );
}
