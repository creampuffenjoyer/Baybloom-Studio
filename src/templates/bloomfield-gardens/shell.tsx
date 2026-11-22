"use client";

import { themeStyle } from "../_kit/theme";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { body, display } from "./fonts";
import { theme } from "./site";
import { Suspense } from "react";
import { LanguagePicker, LanguageProvider } from "./language";
import { usePersonalization } from "./personalization";

/** Wraps every Bloomfield page: theme, fonts, header and footer. */
export function Shell({ children, languagePicker = true }: { children: React.ReactNode; languagePicker?: boolean }) {
  const { accent } = usePersonalization();
  return (
    <Suspense><LanguageProvider><div
      data-template="bloomfield-gardens"
      className={`${display.variable} ${body.variable} flex min-h-dvh flex-col bg-tpl-bg font-tpl-body text-tpl-ink antialiased`}
      style={themeStyle({ ...theme, accent: accent || theme.accent }, { display: "var(--bf-display)", body: "var(--bf-body)" })}
    >
      <a
        href="#content"
        className="sr-only z-[60] bg-tpl-deep px-4 py-2 text-tpl-on-deep focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Header />
      {languagePicker && <LanguagePicker />}
      <main id="content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div></LanguageProvider></Suspense>
  );
}
