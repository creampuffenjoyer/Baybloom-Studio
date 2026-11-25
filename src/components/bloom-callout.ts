export function followBloomTarget(
  card: HTMLElement,
  ring: HTMLElement,
  target: HTMLElement | null,
  { getRect = () => target?.getBoundingClientRect(), preferAbove = false }: {
    getRect?: () => DOMRect | undefined;
    preferAbove?: boolean;
  } = {},
) {
  const viewport = window.visualViewport;
  let pending = 0;

  function position() {
    const top = viewport?.offsetTop ?? 0;
    const left = viewport?.offsetLeft ?? 0;
    const right = left + (viewport?.width ?? document.documentElement.clientWidth);
    const bottom = top + (viewport?.height ?? window.innerHeight);
    const gap = 14;
    const width = Math.max(1, Math.min(304, right - left - 2 * gap));
    card.style.width = `${width}px`;
    card.style.maxHeight = `${Math.max(1, bottom - top - 2 * gap)}px`;
    let height = card.offsetHeight;
    const rect = getRect();
    const x1 = Math.max(left, (rect?.left ?? right) - 6);
    const x2 = Math.min(right, (rect?.right ?? left) + 6);
    const y1 = Math.max(top, (rect?.top ?? bottom) - 6);
    const y2 = Math.min(bottom, (rect?.bottom ?? top) + 6);
    const visible = !!rect && rect.width > 0 && rect.height > 0 && x2 > x1 && y2 > y1;
    ring.hidden = !visible;
    let x = right - gap - width;
    let y = bottom - gap - height;

    if (visible) {
      Object.assign(ring.style, { left: `${x1}px`, top: `${y1}px`, width: `${x2 - x1}px`, height: `${y2 - y1}px` });
      x = Math.min(x, Math.max(left + gap, x1));
      y = y2 + gap;
      if (right - x2 >= width + 2 * gap) {
        x = x2 + gap;
        y = y1;
      } else if (x1 - left >= width + 2 * gap) {
        x = x1 - width - gap;
        y = y1;
      } else {
        const below = bottom - y2 - 2 * gap;
        const above = y1 - top - 2 * gap;
        const useAbove = (preferAbove && above >= height) || (below < height && above > below);
        const space = useAbove ? above : below;
        // Keep the highlighted control reachable when the on-screen keyboard reduces the viewport.
        if (space > 0 && space < height) {
          card.style.maxHeight = `${space}px`;
          height = card.offsetHeight;
        }
        if (useAbove) y = y1 - height - gap;
      }
    }
    card.style.left = `${x}px`;
    card.style.top = `${Math.max(top + gap, Math.min(y, bottom - gap - height))}px`;
  }

  function schedulePosition() {
    if (pending) return;
    pending = requestAnimationFrame(() => {
      pending = 0;
      position();
    });
  }
  const sizing = new ResizeObserver(schedulePosition);
  if (target) sizing.observe(target);
  sizing.observe(card);
  window.addEventListener("scroll", schedulePosition, true);
  window.addEventListener("resize", schedulePosition);
  viewport?.addEventListener("resize", schedulePosition);
  viewport?.addEventListener("scroll", schedulePosition);
  position();

  return () => {
    sizing.disconnect();
    cancelAnimationFrame(pending);
    window.removeEventListener("scroll", schedulePosition, true);
    window.removeEventListener("resize", schedulePosition);
    viewport?.removeEventListener("resize", schedulePosition);
    viewport?.removeEventListener("scroll", schedulePosition);
  };
}
