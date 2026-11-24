"use client";

import "./bloom-spotlight.css";
import { useId, useLayoutEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ArrowRightIcon, XIcon } from "lucide-react";

gsap.registerPlugin(useGSAP);

const normalize = (text: string) => text.normalize("NFC").replace(/\s+/g, " ").trim();

function findPreviewName(frame: HTMLIFrameElement, name: string) {
  const doc = frame.contentDocument;
  const brand = doc?.querySelector("[data-preview-brand]");
  if (!brand || !doc) return null;

  // Only the custom wordmark can unlock this step.
  const walker = doc.createTreeWalker(brand, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const element = node.parentElement;
    if (!element || normalize(node.textContent ?? "") !== name) continue;
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

export function BloomSpotlight({ input, frame, onExit, onComplete }: {
  input: HTMLInputElement;
  frame: HTMLIFrameElement;
  onExit: () => void;
  onComplete: () => void;
}) {
  const titleId = useId();
  const instructionId = useId();
  const [originalName] = useState(() => normalize(input.value));
  const [availableName, setAvailableName] = useState("");
  const [shownName, setShownName] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const hole = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLElement>(null);
  const exit = useRef<HTMLButtonElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  const readingPreview = !!shownName;

  useLayoutEffect(() => {
    if (readingPreview) return;
    let observer: MutationObserver | undefined;
    let composing = false;

    function check() {
      const name = normalize(input.value);
      setAvailableName(!composing && name && name !== originalName && findPreviewName(frame, name) ? name : "");
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
    function startComposition() {
      composing = true;
      check();
    }
    function endComposition() {
      composing = false;
      check();
    }
    input.addEventListener("input", check);
    input.addEventListener("compositionstart", startComposition);
    input.addEventListener("compositionend", endComposition);
    frame.addEventListener("load", observePreview);
    observePreview();
    return () => {
      observer?.disconnect();
      input.removeEventListener("input", check);
      input.removeEventListener("compositionstart", startComposition);
      input.removeEventListener("compositionend", endComposition);
      frame.removeEventListener("load", observePreview);
    };
  }, [frame, input, originalName, readingPreview]);

  useLayoutEffect(() => {
    const overlay = root.current;
    const opening = hole.current;
    const bubble = card.current;
    if (!overlay || !opening || !bubble) return;
    const target = readingPreview ? frame : input;
    const lock = lockOutside(target, overlay);
    const originalDescription = input.getAttribute("aria-describedby");
    const wasFrameInert = frame.inert;
    const viewport = window.visualViewport;
    let pending = 0;

    function position() {
      if (!opening || !bubble) return;
      const top = viewport?.offsetTop ?? 0;
      const left = viewport?.offsetLeft ?? 0;
      const right = left + (viewport?.width ?? document.documentElement.clientWidth);
      const bottom = top + (viewport?.height ?? window.innerHeight);
      const rect = target.getBoundingClientRect();
      const nameRect = shownName ? findPreviewName(frame, shownName)?.getBoundingClientRect() : undefined;
      const pad = readingPreview ? 8 : 6;
      const x1 = Math.min(right - 1, Math.max(left, (nameRect ? rect.left + Math.max(0, nameRect.left) : rect.left) - pad));
      const x2 = Math.max(x1 + 1, Math.min(right, (nameRect ? rect.left + Math.min(rect.width, nameRect.right) : rect.right) + pad));
      const y1 = Math.min(bottom - 1, Math.max(top, (nameRect ? rect.top + Math.max(0, nameRect.top) : rect.top) - pad));
      const y2 = Math.max(y1 + 1, Math.min(bottom, (nameRect ? rect.top + Math.min(rect.height, nameRect.bottom) : rect.bottom) + pad));
      Object.assign(opening.style, { left: `${x1}px`, top: `${y1}px`, width: `${x2 - x1}px`, height: `${y2 - y1}px` });

      const gap = 14;
      const width = Math.min(304, right - left - 2 * gap);
      bubble.style.width = `${width}px`;
      bubble.style.maxHeight = `${bottom - top - 2 * gap}px`;
      const height = bubble.offsetHeight;
      let x = Math.min(right - gap - width, Math.max(left + gap, x1));
      let y = y2 + gap;
      if (right - x2 >= width + 2 * gap) {
        x = x2 + gap;
        y = y1 - 10;
      } else if (x1 - left >= width + 2 * gap) {
        x = x1 - width - gap;
        y = y1 - 10;
      } else if (bottom - y2 < height + gap && y1 - top > bottom - y2) {
        y = y1 - height - gap;
      }
      bubble.style.left = `${x}px`;
      bubble.style.top = `${Math.max(top + gap, Math.min(y, bottom - gap - height))}px`;
    }
    function schedulePosition() {
      if (pending) return;
      pending = requestAnimationFrame(() => {
        pending = 0;
        position();
      });
    }
    const sizing = new ResizeObserver(schedulePosition);
    sizing.observe(target);
    sizing.observe(bubble);
    window.addEventListener("scroll", schedulePosition, true);
    window.addEventListener("resize", schedulePosition);
    viewport?.addEventListener("resize", schedulePosition);
    viewport?.addEventListener("scroll", schedulePosition);

    if (readingPreview) {
      frame.setAttribute("inert", "");
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
    position();

    return () => {
      sizing.disconnect();
      cancelAnimationFrame(pending);
      window.removeEventListener("scroll", schedulePosition, true);
      window.removeEventListener("resize", schedulePosition);
      viewport?.removeEventListener("resize", schedulePosition);
      viewport?.removeEventListener("scroll", schedulePosition);
      if (readingPreview) frame.toggleAttribute("inert", wasFrameInert);
      else if (originalDescription === null) input.removeAttribute("aria-describedby");
      else input.setAttribute("aria-describedby", originalDescription);
      lock();
    };
  }, [frame, input, instructionId, readingPreview, shownName]);

  useLayoutEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        onExit();
      } else if (event.key === "Tab") {
        const controls = [!readingPreview && input, next.current, exit.current].filter(
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
  }, [input, onExit, readingPreview]);

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

  function reveal() {
    const current = normalize(input.value);
    if (current && current === availableName && findPreviewName(frame, current)) setShownName(current);
  }

  return (
    <div ref={root} className="bloom-spotlight">
      <div ref={hole} className="bloom-spotlight-ring" aria-hidden="true" />
      <section ref={card} className="bloom-spotlight-card" tabIndex={-1}
        role="region" aria-labelledby={titleId}>
        <div className="bloom-spotlight-character bloom-avatar" aria-hidden="true" />
        <div className="bloom-spotlight-copy">
          <h2 id={titleId}>{readingPreview ? "Your name is live in the preview" : "Enter your business name"}</h2>
          <p id={instructionId}>{readingPreview
            ? `This is how “${shownName}” looks on your website preview.`
            : "Type your name in the highlighted field. Continue once it has updated in the preview."}</p>
        </div>
        <div className="bloom-spotlight-actions">
          <button ref={next} type="button" className="bloom-action bloom-primary" disabled={!readingPreview && !availableName}
            onClick={readingPreview ? onComplete : reveal}>
            {readingPreview ? "Finish tour" : "See my name in the preview"} <ArrowRightIcon aria-hidden="true" />
          </button>
          <button ref={exit} type="button" className="bloom-action bloom-secondary" onClick={onExit}>
            <XIcon aria-hidden="true" /> Exit tour
          </button>
        </div>
      </section>
    </div>
  );
}
