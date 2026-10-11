import { themeStyle } from "../_kit/theme";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { body, display } from "./fonts";
import { theme } from "./site";

/** Wraps every Isla Verde page: theme, fonts, header and footer. */
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-template="isla-verde-boutique"
      className={`${display.variable} ${body.variable} flex min-h-dvh flex-col bg-t-bg font-t-body text-t-ink antialiased`}
      style={themeStyle(theme, { display: "var(--iv-display)", body: "var(--iv-body)" })}
    >
      <a href="#content" className="sr-only z-[60] bg-t-deep px-4 py-2 text-t-on-deep focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
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
