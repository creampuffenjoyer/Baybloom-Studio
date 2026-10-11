import { themeStyle } from "../_kit/theme";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { body, display } from "./fonts";
import { theme } from "./site";

/** Wraps every Pine Ridge page: theme, fonts, header and footer. */
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-template="pine-ridge-lodge"
      className={`${display.variable} ${body.variable} flex min-h-dvh flex-col bg-tpl-bg font-tpl-body text-[17px] text-tpl-ink antialiased`}
      style={themeStyle(theme, { display: "var(--pr-display)", body: "var(--pr-body)" })}
    >
      <a href="#content" className="sr-only z-[60] bg-tpl-accent px-4 py-2 text-tpl-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <Header />
      <main id="content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
