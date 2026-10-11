import { themeStyle } from "../_kit/theme";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { body, display } from "./fonts";
import { theme } from "./site";

/** Wraps every Ember & Salt page: theme, fonts, header and footer. */
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-template="ember-and-salt"
      className={`${display.variable} ${body.variable} flex min-h-dvh flex-col bg-t-bg font-t-body text-t-ink antialiased selection:bg-t-accent selection:text-t-on-accent`}
      style={themeStyle(theme, { display: "var(--es-display)", body: "var(--es-body)" })}
    >
      <a
        href="#content"
        className="sr-only z-[60] bg-t-accent px-4 py-2 text-t-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
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
