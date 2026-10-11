import type { CSSProperties } from "react";

/** Colours every template defines; Tailwind exposes them as bg-tpl-*, text-tpl-* etc. */
export type Theme = {
  bg: string;
  surface: string;
  soft: string;
  ink: string;
  muted: string;
  line: string;
  accent: string;
  onAccent: string;
  deep: string;
  onDeep: string;
  alt: string;
};

/** Inline style for a template's root element: theme colours plus its font variables. */
export function themeStyle(theme: Theme, fonts: { display: string; body: string }): CSSProperties {
  return {
    "--t-bg": theme.bg,
    "--t-surface": theme.surface,
    "--t-soft": theme.soft,
    "--t-ink": theme.ink,
    "--t-muted": theme.muted,
    "--t-line": theme.line,
    "--t-accent": theme.accent,
    "--t-on-accent": theme.onAccent,
    "--t-deep": theme.deep,
    "--t-on-deep": theme.onDeep,
    "--t-alt": theme.alt,
    "--t-font-display": fonts.display,
    "--t-font-body": fonts.body,
  } as CSSProperties;
}

/** Joins a template's base path with a page path: href("/rooms") → "/demo/x/rooms". */
export function makeHref(base: string) {
  return (path = "/") => (path === "/" ? base || "/" : `${base}${path}`);
}
