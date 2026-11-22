"use client";

import { Suspense } from "react";
import { LanguageProvider, useIsla } from "./language";
import { themeStyle } from "../_kit/theme";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { body, display } from "./fonts";
import { theme } from "./site";
import { usePersonalization } from "./personalization";

/** Wraps every Isla Verde page: theme, fonts, header and footer. */
export function Shell({ children, languagePicker = true }: { children: React.ReactNode; languagePicker?: boolean }) {
  return <Suspense fallback={<div className="min-h-dvh" />}><LanguageProvider><ShellContent languagePicker={languagePicker}>{children}</ShellContent></LanguageProvider></Suspense>;
}

function ShellContent({ children, languagePicker }: { children: React.ReactNode; languagePicker: boolean }) {
  const { t } = useIsla();
  const { accent } = usePersonalization();
  return (
    <div
      data-template="isla-verde-boutique"
      className={`${display.variable} ${body.variable} flex min-h-dvh flex-col bg-tpl-bg font-tpl-body text-tpl-ink antialiased`}
      style={themeStyle({ ...theme, accent: accent || theme.accent }, { display: "var(--iv-display)", body: "var(--iv-body)" })}
    >
      <a href="#content" className="sr-only z-[60] bg-tpl-deep px-4 py-2 text-tpl-on-deep focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        {t("Skip to content")}
      </a>
      <Header languagePicker={languagePicker} />
      <main id="content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
