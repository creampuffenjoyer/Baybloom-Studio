export type Language = "en" | "tl" | "taglish";
export const languageOf = (value: string | null): Language => value === "tl" || value === "taglish" ? value : "en";

export function localizedHref(href: string, language: Language) {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const url = new URL(href, "https://template.invalid");
  url.searchParams.set("lang", language);
  return url.pathname + url.search + url.hash;
}
