import { themeStyle } from "../_kit/theme";
import { body, display } from "./fonts";
import { theme } from "./site";
import { Header } from "./components/header";
import { Footer } from "./components/footer";

/** Wraps every Coral Cove page: theme, fonts, header and footer. */
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-template="coral-cove"
      className={`${display.variable} ${body.variable} flex min-h-dvh flex-col bg-t-bg font-t-body text-t-ink antialiased`}
      style={themeStyle(theme, { display: "var(--cc-display)", body: "var(--cc-body)" })}
    >
      <a
        href="#content"
        className="sr-only z-[60] rounded-full bg-t-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
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
