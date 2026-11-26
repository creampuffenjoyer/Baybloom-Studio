import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Photo } from "./photo";
import { input, label } from "../hospitality-site";
import { CreditsList } from "../credits-list";
import { SampleRequest } from "../sample-request";
import { StudioGallery } from "./gallery";
import { studioHref, type StudioLink, type StudioPhoto, type StudioSection, type StudioSite } from "./types";
import "./design.css";
import "./reference-layouts.css";
import "./editions.css";

export function StudioShell({ children, site, base }: { children: ReactNode; site: StudioSite; base: string }) {
  const { theme } = site;
  const style = {
    "--t-surface": theme.surface, "--t-ink": theme.ink, "--t-muted": theme.muted,
    "--t-line": theme.line, "--t-accent": theme.accent, "--t-on-accent": theme.onAccent,
    "--t-deep": theme.deep, "--t-on-deep": theme.onDeep, "--st-paper": theme.paper,
  } as CSSProperties;

  return (
    <div className="st-site" data-template={site.variant} data-studio-variant={site.variant} style={style}>
      <a href="#studio-main" className="st-skip">Skip to content</a>
      <header className="st-header">
        <div className="st-wrap st-header-inner">
          <div className="st-brand-block">
            <Link href={studioHref(base, "")} className="st-brand">{site.name}</Link>
            {site.mastheadNote && <p>{site.mastheadNote}</p>}
          </div>
          <nav aria-label="Site navigation">
            {site.nav.map((link) => <Link key={link.href} href={studioHref(base, link.href)}>{link.label}</Link>)}
          </nav>
        </div>
      </header>
      <main id="studio-main">{children}</main>
      <footer className="st-footer">
        <div className="st-wrap edition-footer">
          <div><Link href={studioHref(base, "")} className="st-brand">{site.name}</Link><p>{site.footer}</p></div>
          <section><h2>{site.desk.heading}</h2>{site.desk.lines.map(line => <p key={line}>{line}</p>)}</section>
          <nav aria-label="Footer navigation">{[...site.desk.links, { label: "Image credits", href: "/credits" }].map(link => <Link key={link.href} href={studioHref(base, link.href)}>{link.label}</Link>)}</nav>
        </div>
      </footer>
    </div>
  );
}

function Action({ link, base }: { link: StudioLink; base: string }) {
  return <Link className="st-text-link" href={studioHref(base, link.href)}>{link.label}<span aria-hidden="true">↗</span></Link>;
}

export function StudioSections({ site, base, photos }: { site: StudioSite; base: string; photos: Record<string, StudioPhoto> }) {
  return site.sections.map(section => <StudioSectionView key={section.id} section={section} base={base} photos={photos} />);
}

function StudioSectionView({ section, base, photos }: { section: StudioSection; base: string; photos: Record<string, StudioPhoto> }) {
  const heading = (
    <header className="st-section-head">
      {section.eyebrow && <p className="st-eyebrow">{section.eyebrow}</p>}
      <h2 id={`${section.id}-title`}>{section.title}</h2>
      {section.intro && <p>{section.intro}</p>}
    </header>
  );
  let content: ReactNode;

  switch (section.type) {
    case "cards":
      content = (
        <div className="st-cards">
          {section.items.map((item) => (
            <article key={item.title} className="st-card">
              <Photo photo={photos[item.image]} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
              <div className="st-card-copy">
                {item.meta && <p className="st-card-meta">{item.meta}</p>}<h3>{item.title}</h3>
                {item.description && <p>{item.description}</p>}
                {item.details && <details><summary>Details</summary><p>{item.details}</p></details>}
                {item.link && <Action link={item.link} base={base} />}
              </div>
            </article>
          ))}
        </div>
      );
      break;
    case "gallery":
      content = <StudioGallery photos={photos} items={section.items} />;
      break;
    case "links":
      content = <ul className="st-image-links">{section.items.map((item) => <li key={item.href}>
        <Link href={studioHref(base, item.href)}>
          <Photo photo={photos[item.image]} sizes="12rem" />
          <span>{item.label}</span><span aria-hidden="true">↗</span>
        </Link>
      </li>)}</ul>;
      break;
    case "faq":
      content = <div className="st-faq">{section.items.map((item) => <details key={item.question}>
        <summary>{item.question}</summary><p>{item.answer}</p>
      </details>)}</div>;
      break;
    case "editorial":
      content = <div className="st-editorial-content"><p>{section.body}</p>{section.link && <Action link={section.link} base={base} />}</div>;
      break;
    case "menu":
      content = (
        <div className="st-menu">
          {section.groups.map((group) => (
            <article className="st-menu-group" key={group.title}>
              <Photo photo={photos[group.image]} sizes="(min-width: 760px) 50vw, 100vw" />
              <div className="st-menu-copy">
                <h3>{group.title}</h3>
                <ul>{group.items.map((item) => <li key={item.name}><div><strong>{item.name}</strong><span>{item.price}</span></div><p>{item.description}</p></li>)}</ul>
              </div>
            </article>
          ))}
        </div>
      );
      break;
    case "pricing":
      content = (
        <div className="st-pricing">
          {section.packages.map((pack) => (
            <article className="st-price" data-featured={pack.featured || undefined} key={pack.name}>
              <h3>{pack.name}</h3><p className="st-price-number">{pack.price}</p><p>{pack.description}</p>
              <ul>{pack.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
              <Action link={section.link} base={base} />
            </article>
          ))}
        </div>
      );
      break;
    case "list":
      content = <dl className="st-list">{section.items.map((item) => <div key={item.name}><dt>{item.name}</dt><dd>{item.description}</dd></div>)}</dl>;
      break;
    case "request":
      content = (
        <SampleRequest submitLabel={section.submitLabel} confirmation={section.confirmation}>
          <label className={label}>{section.optionLabel}<select className={input} name="interest" defaultValue="" required>
            <option value="" disabled>Choose an option</option>{section.options.map((option) => <option key={option}>{option}</option>)}
          </select></label>
          {section.dateLabel && <label className={label}>{section.dateLabel}<input className={input} type="date" name="date" /></label>}
          <label className={label}>{section.notesLabel}<textarea className={input} name="notes" rows={3} maxLength={1000} /></label>
        </SampleRequest>
      );
      break;
    case "note":
      content = <p>{section.body}</p>;
      break;
  }

  const image = (section.type === "editorial" || section.type === "list") && section.image && photos[section.image];
  const detailPhoto = section.type === "editorial" && section.detailPhoto && photos[section.detailPhoto];
  const backdrop = section.type === "gallery" && section.backdrop && photos[section.backdrop];
  return (
    <section id={section.id} className={`st-section st-section-${section.type}`} aria-labelledby={`${section.id}-title`}>
      {backdrop && <div className="st-section-backdrop" aria-hidden="true"><Photo photo={backdrop} sizes="100vw" /></div>}
      <div className="st-wrap st-section-inner">
        {image && <div className="st-section-media" data-layered={Boolean(detailPhoto) || undefined}>
          <Photo photo={image} sizes="(min-width: 760px) 50vw, 100vw" />
          {detailPhoto && <Photo photo={detailPhoto} sizes="(min-width: 760px) 22vw, 50vw" />}
        </div>}
        <div className="st-section-content">{heading}{content}</div>
        {section.type === "request" && section.images?.length && <div className="st-request-media">
          {section.images.map((key) => <Photo key={key} photo={photos[key]} sizes="(min-width: 760px) 34vw, 50vw" />)}
        </div>}
      </div>
    </section>
  );
}

export function StudioCredits({ photos, base }: { photos: Record<string, StudioPhoto>; base: string }) {
  return (
    <section className="st-wrap st-section-inner st-standalone">
      <h1>Image credits</h1>
      <CreditsList photos={Object.values(photos)} className="mt-8 max-w-2xl divide-y divide-tpl-line" />
      <Action link={{ label: "Back to home", href: "" }} base={base} />
    </section>
  );
}
