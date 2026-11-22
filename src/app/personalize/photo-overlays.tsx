"use client";

import { useEffect, useState } from "react";
import { PHOTO_TEMPLATES } from "./photo-templates";

type Target = { id: string; top: number; left: number; width: number; height: number };
export function PhotoOverlays({ enabled, selected, page, template = "coral-cove" }: { enabled: boolean; selected?: string; page: string; template?: keyof typeof PHOTO_TEMPLATES }) {
  const config = PHOTO_TEMPLATES[template];
  const attribute = template === "coral-cove" || template === "harbor-house" ? `data-${config.prefix}-photo` : "data-location-photo";
  const [targets, setTargets] = useState<Target[]>([]);
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    function update() {
      frame = 0;
      const headerBottom = Math.max(0, document.querySelector("header")?.getBoundingClientRect().bottom ?? 0);
      const next = [...document.querySelectorAll<HTMLImageElement>(`img[${attribute}]`)].flatMap(image => {
        const id = image.getAttribute(attribute)!;
        if (!config.get(id)) return [];
        if (Number(getComputedStyle(image).opacity) === 0 || getComputedStyle(image).visibility === "hidden") return [];
        const bounds = image.getBoundingClientRect();
        const rect = { top: bounds.top, left: bounds.left, right: bounds.right, bottom: bounds.bottom };
        for (let parent = image.parentElement; parent; parent = parent.parentElement) {
          const style = getComputedStyle(parent), clip = parent.getBoundingClientRect();
          if (/hidden|clip|auto|scroll/.test(style.overflowX)) { rect.left = Math.max(rect.left, clip.left); rect.right = Math.min(rect.right, clip.right); }
          if (/hidden|clip|auto|scroll/.test(style.overflowY)) { rect.top = Math.max(rect.top, clip.top); rect.bottom = Math.min(rect.bottom, clip.bottom); }
        }
        const top = Math.max(rect.top, headerBottom); const left = Math.max(0, rect.left);
        const width = Math.min(innerWidth, rect.right) - left; const height = Math.min(innerHeight, rect.bottom) - top;
        return width > 8 && height > 8 ? [{ id, top, left, width, height }] : [];
      });
      setTargets(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    const resize = new ResizeObserver(schedule); resize.observe(document.body);
    const mutations = new MutationObserver(schedule);
    mutations.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["src", attribute] });
    window.addEventListener("scroll", schedule, true); window.addEventListener("resize", schedule);
    schedule();
    return () => { cancelAnimationFrame(frame); resize.disconnect(); mutations.disconnect(); window.removeEventListener("scroll", schedule, true); window.removeEventListener("resize", schedule); };
  }, [enabled, page, attribute, config, selected]);
  useEffect(() => {
    if (!enabled || !selected) return;
    const frame = requestAnimationFrame(() => {
      const photo = [...document.querySelectorAll<HTMLElement>(`[${attribute}]`)].find(element => element.getAttribute(attribute) === selected);
      photo?.scrollIntoView({ block: "center", behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, [selected, page, enabled, attribute]);
  if (!enabled) return null;
  return <div className="pointer-events-none fixed inset-0 z-[60]" aria-label="Editable photos">
    {targets.map(target => {
      const item = config.get(target.id)!;
      return <button key={target.id} type="button" aria-label={`Change photo: ${item.pageName} — ${item.name}`} aria-pressed={selected === target.id}
        onClick={() => window.parent.postMessage({ type: `${config.prefix}-photo-selected`, placement: target.id }, location.origin)}
        style={{ position: "absolute", top: target.top, left: target.left, width: target.width, height: target.height }}
        className={`group pointer-events-auto cursor-pointer border-2 text-left transition-colors hover:border-[#0f4c5c] focus-visible:border-[#0f4c5c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${selected === target.id ? "border-[#0f4c5c]" : "border-transparent"}`}>
        <span className={`absolute top-2 left-2 max-w-[calc(100%-1rem)] rounded-md bg-white px-3 py-2 font-sans text-xs leading-4 font-medium text-[#203b3b] shadow-sm group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100 ${selected === target.id ? "opacity-100" : "opacity-0"}`}>Change photo · {item.name}</span>
      </button>;
    })}
  </div>;
}
