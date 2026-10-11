import { themeStyle } from "../_kit/theme";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { body, display, hand } from "./fonts";
import { theme } from "./site";

/** Wraps every Harbor House page: theme, fonts, header and footer. */
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-template="harbor-house"
      className={`${display.variable} ${body.variable} ${hand.variable} flex min-h-dvh flex-col bg-tpl-bg font-tpl-body text-tpl-ink antialiased`}
      style={themeStyle(theme, { display: "var(--hh-display)", body: "var(--hh-body)" })}
    >
      <a href="#content" className="sr-only z-[60] rounded-full bg-tpl-accent px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
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
