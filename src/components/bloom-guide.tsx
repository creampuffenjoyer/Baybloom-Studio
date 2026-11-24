"use client";

import "./bloom-guide.css";
import { createPortal } from "react-dom";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRightIcon, ChevronRightIcon, MinusIcon, PhoneIcon, RotateCcwIcon, SparkleIcon } from "lucide-react";
import { BloomSpotlight } from "./bloom-spotlight";

type Match = { slug: string; title: string; kind: string; line: string };
type Stage = "welcome" | "business" | "lodging" | "match" | "edit" | "done" | "packages" | "contact";
type Progress = { stage: Stage; slug?: string; open: boolean };
gsap.registerPlugin(useGSAP);

const initial: Progress = { stage: "welcome", open: false };
const key = "baybloom.guide.v1";
const categories = [
  ["Restaurant or bar", "Restaurant & bar"],
  ["Spa", "Day spa"],
  ["Event venue", "Wedding venue"],
];
const lodging = ["Beach resort", "Heritage hotel", "Bed & breakfast", "Mountain lodge", "Lakeside villas"];

function GuideAction({ children, onClick, disabled, kind = "primary" }: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  kind?: "primary" | "option" | "secondary";
}) {
  return <button className={`bloom-action bloom-${kind}`} type="button" onClick={onClick} disabled={disabled}>
    {children}
    {kind === "primary" && <ArrowRightIcon aria-hidden="true" />}
    {kind === "option" && <ChevronRightIcon aria-hidden="true" />}
  </button>;
}

export function BloomGuide({ page, matches = [], slug, ready, previewUrl, canEdit = true }: {
  page: "home" | "catalog" | "design" | "editor" | "cart" | "checkout";
  matches?: Match[];
  slug?: string;
  ready?: boolean;
  previewUrl?: string | null;
  canEdit?: boolean;
}) {
  const [progress, setProgress] = useState(initial);
  const [loaded, setLoaded] = useState(false);
  const [watching, setWatching] = useState(false);
  const [notice, setNotice] = useState("");
  const [spotlight, setSpotlight] = useState<{ input: HTMLInputElement; frame: HTMLIFrameElement } | null>(null);
  const spotlightLauncher = useRef<HTMLButtonElement>(null);
  const previousStage = useRef<Stage>("welcome");
  const toggle = useRef<HTMLButtonElement>(null);
  const [newcomer, setNewcomer] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const prompt = useRef<HTMLHeadingElement>(null);
  const panel = useRef<HTMLElement>(null);
  const baseline = useRef("");
  useEffect(() => {
    let saved: Progress | undefined;
    try { saved = JSON.parse(localStorage.getItem(key) || "null"); } catch {}
    const active = saved?.slug === slug && !!slug && saved?.open;
    const restart = window.location.hash === "#ask-bloom";
    const commerce = page === "cart" || page === "checkout";
    const browse = page === "catalog" || page === "home";
    const opening = restart || (browse || commerce ? !!saved?.open : !!active) || (page === "editor" && window.location.hash === "#business-name");
    const atPackages = page === "design" && window.location.hash === "#tiers";
    const stage = page === "editor" ? "edit" : atPackages ? "packages" : restart ? "business" : saved?.stage ?? "welcome";
    const frame = requestAnimationFrame(() => {
      setNewcomer(!saved && (browse || page === "design"));
      setProgress({ stage, slug: saved?.slug, open: opening });
      setLoaded(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [page, slug]);

  const update = useCallback((next: Progress) => {
    setProgress(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
  }, []);

  function step(stage: Stage, selected = progress.slug) {
    update({ stage, slug: selected, open: true });
    requestAnimationFrame(() => prompt.current?.focus());
  }
  function focusName() {
    const input = document.querySelector<HTMLInputElement>("#business-name");
    if (!input || input.matches(":disabled")) return;
    baseline.current = input.value;
    if (window.matchMedia("(max-width: 36rem)").matches) {
      input.scrollIntoView({ block: "start" });
    }
    input.focus({ preventScroll: true });
    setWatching(true);
    setNotice("");
  }
  const autoFocused = useRef(false);
  useEffect(() => {
    if (page === "editor" && ready && loaded && progress.open && !autoFocused.current) {
      autoFocused.current = true;
      focusName();
    }
  }, [page, ready, loaded, progress.open]);

  function viewName() {
    const name = document.querySelector<HTMLInputElement>("#business-name")?.value.trim();
    const frame = document.querySelector<HTMLIFrameElement>("iframe[data-business-preview]");
    if (!name || name === baseline.current.trim()) {
      setNotice("Enter a new business name first.");
      document.getElementById("business-name")?.focus();
      return;
    }
    // Some templates display the business name in lowercase through CSS.
    const rendered = frame?.contentDocument?.body.innerText.toLocaleLowerCase("en");
    if (!frame || !rendered?.includes(name.toLocaleLowerCase("en"))) {
      setNotice("Your preview is updating. Try again in a moment.");
      return;
    }
    update({ stage: "done", slug, open: true });
    setWatching(false);
    frame.scrollIntoView({ block: "center" });
    frame.focus();
  }
  const close = useCallback(() => {
    update({ ...progress, open: false });
    if (window.location.hash === "#business-name" || window.location.hash === "#ask-bloom") {
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    }
    requestAnimationFrame(() => toggle.current?.focus());
  }, [progress, update]);

  function startSpotlight() {
    const input = document.querySelector<HTMLInputElement>("#business-name");
    const frame = document.querySelector<HTMLIFrameElement>("iframe[data-business-preview]");
    if (input && frame?.contentDocument && !input.matches(":disabled")) {
      setSpotlight({ input, frame });
    }
  }

  function exitSpotlight() {
    setSpotlight(null);
    requestAnimationFrame(() => spotlightLauncher.current?.focus());
  }

  function completeSpotlight() {
    setSpotlight(null);
    setWatching(false);
    step("done", slug);
  }

  useEffect(() => {
    if (!progress.open || spotlight) return;
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape" && !document.querySelector('[aria-modal="true"]')) close();
    }
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [progress.open, close, spotlight]);

  useGSAP(() => {
    if (!panel.current) return;
    const media = gsap.matchMedia(panel.current);
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.timeline({ defaults: { ease: "power2.out" } })
        .from(panel.current, { y: 13, opacity: 0.4, scale: 0.98, duration: 0.3 }, 0)
        .from(".bloom-portrait", { y: 10, rotation: -7, duration: 0.52, ease: "back.out(1.5)" }, 0.05);
    });
    return () => media.revert();
  }, { scope: panel, dependencies: [progress.open], revertOnUpdate: true });

  useGSAP(() => {
    if (!panel.current) return;
    const media = gsap.matchMedia(panel.current);
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const timeline = gsap.timeline({ defaults: { ease: "power2.out" } });
      timeline.from(".bloom-copy", { y: 5, opacity: 0.55, duration: 0.22 }, 0);
      timeline.from(".bloom-actions > *", { y: 4, opacity: 0.6, duration: 0.2, stagger: 0.035 }, 0.04);
      if (progress.stage === "match" || progress.stage === "done") {
        timeline.from(".bloom-portrait .bloom-avatar", { y: 7, rotation: -12, scale: 0.94, duration: 0.46, ease: "back.out(2.5)" }, 0);
        timeline.fromTo(".bloom-sparkle", { scale: 0.45, opacity: 0.3 }, { scale: 1.25, opacity: 1, duration: 0.24, stagger: 0.065 }, 0.06)
          .to(".bloom-sparkle", { scale: 1, opacity: 0.68, duration: 0.22 }, 0.34);
      }
    });
    return () => media.revert();
  }, { scope: panel, dependencies: [progress.open, progress.stage], revertOnUpdate: true });

  if (!loaded) return null;
  const { stage, open } = progress;
  const match = matches.find(item => item.slug === progress.slug);
  const commerce = page === "cart" || page === "checkout";
  const stepNumber = commerce || stage === "packages" || stage === "contact" ? 3 : page === "editor" ? 2 : 1;
  const stepName = ["Find your design", "Make it yours", "Order your website"][stepNumber - 1];
  const browseAll = page === "home" && stage !== "welcome" && stage !== "contact";
  const allDesigns = <Link className="bloom-action bloom-secondary" href="/designs" onClick={close}>Show all designs</Link>;

  function openGuide() {
    setNewcomer(false);
    update({ ...progress, slug: slug ?? progress.slug, open: true });
    requestAnimationFrame(() => heading.current?.focus());
  }

  function restart() {
    if (page === "editor") {
      update({ stage: "edit", slug, open: true });
      focusName();
    } else {
      update({ stage: "business", open: true });
      requestAnimationFrame(() => prompt.current?.focus());
    }
  }

  let title: string;
  let description: ReactNode;
  let actions: ReactNode;

  if (stage === "contact") {
    title = "Order with the studio owner";
    description = <>
      <p>Call with the design you like and the changes you need. You can discuss the package before placing your order.</p>
      <p className="bloom-note">Email coming soon · baybloom.studios@gmail.com</p>
    </>;
    actions = <>
      <a className="bloom-action bloom-primary" href="tel:+639669221451">Call +63 966 922 1451 <PhoneIcon aria-hidden="true" /></a>
      <GuideAction kind="secondary" onClick={() => step(previousStage.current)}>Back to guide</GuideAction>
    </>;
  } else if (commerce) {
    title = page === "cart" ? "Review your cart" : "Finish your order";
    description = <p>{page === "cart"
      ? "Review your designs, packages and extras. Enter any coupon in Summary, then choose Continue to checkout."
      : "Check your billing details, choose original or saved content for each eligible design, and review the total. Use Pay securely or Complete order. Your order page shows download availability."}</p>;
  } else if ((page === "design" || page === "editor") && stage === "packages") {
    title = "Choose how to order";
    description = <>
      <p>Log in to compare prices, choose a package and add any extras. Select <strong>Buy now</strong> to review your order or <strong>Add to cart</strong> to keep browsing.</p>
      {page === "editor" && <p>Save your draft here if you want to use your own content at checkout.</p>}
    </>;
    actions = page === "editor"
      ? <Link className="bloom-action bloom-primary" href={`/designs/${slug}#tiers`} target="_blank" rel="noopener">Compare packages in a new tab <ArrowRightIcon aria-hidden="true" /></Link>
      : <GuideAction onClick={() => { document.getElementById("tiers")?.scrollIntoView(); close(); }}>Show packages</GuideAction>;
  } else if (page === "editor") {
    title = stage === "done" ? "There’s your name!" : "Try your business name";
    description = stage === "done"
      ? <p>Only your preview has changed. Try a new headline, color or photo. Sign in and save your changes to use them at checkout.</p>
      : <p>Enter the name your guests know in <strong>Business name</strong> to see it in your private preview.</p>;
    actions = stage === "done"
      ? <GuideAction onClick={() => step("packages", slug)}>Explore order options</GuideAction>
      : <>
        <GuideAction onClick={watching ? viewName : focusName} disabled={!ready}>{watching ? "See my name in the preview" : "Go to Business name"}</GuideAction>
        <button ref={spotlightLauncher} type="button" className="bloom-action bloom-option" onClick={startSpotlight} disabled={!ready}>
          Show me where <SparkleIcon aria-hidden="true" />
        </button>
        {notice && <p className="bloom-note" role="status">{notice}</p>}
      </>;
  } else if (page === "design") {
    title = "Get to know this design";
    description = <p>{canEdit ? "Explore the sample site as a guest, or see how it looks with your name." : "Explore the sample site as a guest, or compare packages."}</p>;
    actions = <>
      {previewUrl && <Link className="bloom-action bloom-primary" href={previewUrl} onClick={() => update({ stage: "edit", slug, open: true })}>Explore the sample site <ArrowRightIcon aria-hidden="true" /></Link>}
      {canEdit && <Link className="bloom-action bloom-option" href={`/personalize/${slug}#business-name`} onClick={() => update({ stage: "edit", slug, open: true })}>Try my business name <ChevronRightIcon aria-hidden="true" /></Link>}
      <GuideAction kind="secondary" onClick={() => step("packages", slug)}>Explore order options</GuideAction>
    </>;
  } else if (stage === "match" && match) {
    title = match.title;
    description = <><p className="bloom-kind">{match.kind}</p><p>{match.line}</p></>;
    actions = <>
      <Link className="bloom-action bloom-primary" href={`/designs/${match.slug}`}>Open this design <ArrowRightIcon aria-hidden="true" /></Link>
      {allDesigns}
    </>;
  } else if (stage === "lodging") {
    title = "What kind of place do guests stay in?";
    actions = matches.filter(item => lodging.includes(item.kind)).map(item =>
      <GuideAction key={item.slug} kind="option" onClick={() => step("match", item.slug)}>{item.kind}</GuideAction>);
  } else if (stage === "welcome" && page === "home") {
    title = "Let’s find your website";
    description = <p>I’m Bloom. I’ll help you choose a design and see how it could look with your business name.</p>;
    actions = <>
      <GuideAction onClick={() => step("business")}>Help me find a design</GuideAction>
      <GuideAction kind="secondary" onClick={close}>I’ll explore</GuideAction>
    </>;
  } else {
    title = "What kind of business do you run?";
    actions = <>
      {matches.some(item => lodging.includes(item.kind)) && <GuideAction kind="option" onClick={() => step("lodging")}>A place to stay</GuideAction>}
      {categories.map(([label, kind]) => {
        const item = matches.find(entry => entry.kind === kind);
        return item && <GuideAction key={kind} kind="option" onClick={() => step("match", item.slug)}>{label}</GuideAction>;
      })}
    </>;
  }

  return createPortal(
    <>
    <aside aria-label="Bloom, your studio guide" className="bloom-dock" hidden={!!spotlight}>
      <button ref={toggle} type="button" aria-expanded={open} aria-haspopup="dialog" onClick={openGuide} hidden={open}
        className={`bloom-launch${newcomer ? " bloom-shine" : ""}`}>
        <span aria-hidden="true" className="bloom-launch-portrait"><span className="bloom-avatar" /></span>
        {newcomer ? "Need any help?" : "Ask Bloom"}
      </button>
      {open && <section ref={panel} role="dialog" aria-labelledby="bloom-heading" className="bloom-panel">
        <header className="bloom-header">
          <div className="bloom-heading">
            <h2 id="bloom-heading" ref={heading} tabIndex={-1}>Bloom</h2>
            <p>{stepName}</p>
            <div className="bloom-progress" role="progressbar" aria-label="Guide progress" aria-valuemin={0} aria-valuemax={3} aria-valuenow={stepNumber}>
              {[1, 2, 3].map(number => <span key={number} data-filled={number <= stepNumber} />)}
            </div>
          </div>
          <div aria-hidden="true" className="bloom-portrait">
            <span className="bloom-avatar" />
            <SparkleIcon className="bloom-sparkle bloom-sparkle-top" />
            <SparkleIcon className="bloom-sparkle bloom-sparkle-bottom" />
          </div>
          <button className="bloom-minimize" type="button" onClick={close} aria-label="Minimize Bloom"><MinusIcon aria-hidden="true" /></button>
        </header>
        <div className="bloom-content">
          <div className="bloom-copy" aria-live="polite">
            <h3 ref={prompt} tabIndex={-1}>{title}</h3>
            {description}
          </div>
          {(actions || browseAll) && <div className="bloom-actions">
            {actions}
            {browseAll && !(stage === "match" && match) && allDesigns}
          </div>}
        </div>
        {stage !== "contact" && <footer className="bloom-footer">
          <button type="button" onClick={() => { previousStage.current = stage; step("contact", slug ?? progress.slug); }}><PhoneIcon aria-hidden="true" /> Order with the owner</button>
          {(page === "design" ? <Link href="/designs#ask-bloom" onClick={() => update({ stage: "business", open: true })}><RotateCcwIcon aria-hidden="true" /> Start again</Link>
            : !commerce && stage !== "welcome" && <button type="button" onClick={restart}><RotateCcwIcon aria-hidden="true" /> Start again</button>)}
        </footer>}
      </section>}
    </aside>
    {spotlight && <BloomSpotlight {...spotlight} onExit={exitSpotlight} onComplete={completeSpotlight} />}
    </>,
    document.body,
  );
}
