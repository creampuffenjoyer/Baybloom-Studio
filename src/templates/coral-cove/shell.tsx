"use client";
import { Suspense } from "react";
import { LanguageProvider, LanguagePicker, useCoral } from "./language";
import { themeStyle } from "../_kit/theme";
import { body, display } from "./fonts";
import { theme } from "./site";
import { Header } from "./components/header";
import { Footer } from "./components/footer";
import { usePersonalization } from "./personalization";

/** Wraps every Coral Cove page: theme, fonts, header and footer. */
export function Shell({ children, languagePicker = true }: { children: React.ReactNode; languagePicker?: boolean }) {
  return <Suspense fallback={<p role="status">Loading / Naglo-load…</p>}><LanguageProvider><ShellContent languagePicker={languagePicker}>{children}</ShellContent></LanguageProvider></Suspense>;
}
function ShellContent({ children, languagePicker }: { children: React.ReactNode; languagePicker: boolean }) {
  const { t } = useCoral();
  const { accent } = usePersonalization();
  return (
    <div
      data-template="coral-cove"
      className={`${display.variable} ${body.variable} flex min-h-dvh flex-col bg-tpl-bg font-tpl-body text-tpl-ink antialiased`}
      style={themeStyle({ ...theme, accent: accent || theme.accent }, { display: "var(--cc-display)", body: "var(--cc-body)" })}
    >
      <a
        href="#content"
        className="sr-only z-[60] rounded-full bg-tpl-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t("Skip to content")}
      </a>
      {languagePicker && <LanguagePicker />}
      <Header />
      <main id="content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
