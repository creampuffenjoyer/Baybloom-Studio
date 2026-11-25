"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import { STUDIO_EMAIL, STUDIO_EMAIL_HREF, STUDIO_PHONE, STUDIO_PHONE_HREF } from "@/lib/checkout-methods";
import { BloomTutorialHint } from "./bloom-tutorial-hint";
import type { TutorialProgress } from "./bloom-tutorial-progress";

export type TutorialPage = "home" | "catalog" | "design" | "preview" | "editor";
export const packageTutorialHref = (slug: string) => `/designs/${slug}?bloom=packages#tiers`;

export function BloomTutorial({ page, slug, progress, atPackages, ready, canEdit, previewUrl, suggestedPage, suggestedDesign, onAdvance, onExercise, onExit }: {
  page: Exclude<TutorialPage, "home">;
  slug?: string;
  progress: TutorialProgress;
  atPackages: boolean;
  ready?: boolean;
  canEdit: boolean;
  previewUrl?: string | null;
  suggestedPage?: string;
  suggestedDesign?: { slug: string; title: string };
  onAdvance: (update: Partial<TutorialProgress>) => void;
  onExercise: () => void;
  onExit: () => void;
}) {
  const [showContact, setShowContact] = useState(false);
  const packagesHref = slug ? packageTutorialHref(slug) : "/designs";
  const editorHref = `/personalize/${slug}#business-name`;
  const button = (label: string, onClick: () => void, style = "primary", disabled = false) =>
    <button type="button" className={`bloom-action bloom-${style}`} onClick={onClick} disabled={disabled}>{label}</button>;
  const link = (label: string, href: string, style = "primary") =>
    <Link className={`bloom-action bloom-${style}`} href={href}>{label}</Link>;
  const paymentInstructions = <>
    <p>Sign in to see prices and pick a tier and any extras. <strong>Buy now</strong> takes you to checkout. <strong>Add to cart</strong> lets you keep browsing.</p>
    <p>At checkout, confirm your delivery email. Select <strong>Pay securely</strong> for cards, or choose GCash where available. Hosting setup includes an emailed live website link with your ZIP.</p>
  </>;
  const contactDetails = showContact && <p>Call or email the studio to discuss your design and package.</p>;
  const contactAction = showContact
    ? <>
        <a className="bloom-action bloom-secondary" href={STUDIO_PHONE_HREF}>Call {STUDIO_PHONE}</a>
        <a className="bloom-action bloom-secondary min-w-0 [overflow-wrap:anywhere]" href={STUDIO_EMAIL_HREF}>{STUDIO_EMAIL}</a>
      </>
    : button("Order with the owner", () => setShowContact(true), "secondary");

  let title: string;
  let target: string | undefined;
  let compactTarget: string | undefined;
  let copy: ReactNode;
  let actions: ReactNode;
  let fallback: ReactNode;
  let onTargetChange: (() => void) | undefined;

  if (page === "catalog") {
    title = "Pick a design for your business";
    target = "catalog";
    copy = <p>Use search and filters to find a design that fits. {suggestedDesign && <>Skip this step to try <strong>{suggestedDesign.title}</strong>.</>}</p>;
    actions = suggestedDesign && link("Skip step", `/designs/${suggestedDesign.slug}`, "secondary");
    fallback = button("Continue", onExit);
  } else if (page === "design" && atPackages) {
    if (progress.packages === "pricing") {
      title = "Know your buying options";
      target = "pricing";
      copy = <>{paymentInstructions}{contactDetails}</>;
      actions = <>{button("Finish tour", onExit)}{contactAction}</>;
    } else {
      title = "Compare the packages";
      target = "tiers";
      compactTarget = "tiers-intro";
      copy = <p>Check what each tier includes and how many revision rounds you get. Then I’ll show you where to see prices and add-ons.</p>;
      const next = () => onAdvance({ packages: "pricing" });
      actions = <>{button("Show buying options", next)}{button("Skip step", next, "secondary")}</>;
    }
  } else if (page === "design") {
    title = "See what your guests will see";
    target = previewUrl ? "demo" : "personalize";
    copy = <p>{previewUrl
      ? <>Click <strong>Try the live demo</strong> to explore the site as a guest. See what they can find before they book or get in touch.</>
      : <>Use <strong>Personalize this template</strong> to try your own details, or continue to compare the packages.</>}</p>;
    const next = canEdit ? editorHref : packagesHref;
    actions = link("Skip step", next, "secondary");
    fallback = link("Continue", previewUrl || next);
  } else if (page === "preview") {
    if (progress.preview !== "edit") {
      title = "Explore a guest page";
      target = "preview-pages";
      copy = <p>Use <strong>Explore</strong> to open {suggestedPage ? <> <strong>{suggestedPage}</strong></> : "another page"}. See how guests find what they need.</p>;
      onTargetChange = () => onAdvance({ preview: "edit" });
      actions = button("Skip step", onTargetChange, "secondary");
      fallback = button("Continue", onTargetChange);
    } else {
      title = "Try the design with your name";
      target = "preview-edit";
      copy = <p>Click <strong>Try my business name</strong> to open the private editor. You can try a change and see how it looks.</p>;
      actions = link("Skip step", packagesHref, "secondary");
      fallback = link("Continue", canEdit ? editorHref : packagesHref);
    }
  } else {
    switch (progress.editor ?? "name") {
      case "name": {
        title = "Make the design yours";
        target = "name";
        copy = <p>Try one change in the <strong>Business name</strong> field, then look for it in your private preview.</p>;
        actions = <>
          {button("Start name exercise", onExercise, "primary", !ready)}
          {button("Skip step", () => onAdvance({ editor: "color" }), "secondary")}
        </>;
        fallback = !ready && <p role="status">The editor is loading. You can skip this step to keep going.</p>;
        break;
      }
      case "color": {
        title = "Try your brand color";
        target = "color";
        copy = <p>Use <strong>Accent color</strong> to see how a brand color looks on buttons and other details. Try it if you like.</p>;
        const next = () => onAdvance({ editor: "photos" });
        actions = <>{button("Continue", next)}{button("Skip step", next, "secondary")}</>;
        break;
      }
      case "photos": {
        title = "See where photos can change";
        target = "photos";
        copy = <p>Choose <strong>Edit photos</strong> where available, then select a photo in the preview. You can explore this step without uploading a photo.</p>;
        const next = () => onAdvance({ editor: "save" });
        actions = <>{button("Continue", next)}{button("Skip step", next, "secondary")}</>;
        break;
      }
      case "save": {
        title = "Keep your edits for checkout";
        target = "save";
        copy = <p>Use <strong>Save changes</strong> or <strong>Save draft</strong> to keep this version. Sign in to save it and choose it later at checkout. Saving is optional in this tutorial.</p>;
        const next = () => onAdvance({ editor: "review" });
        actions = <>{button("Continue", next)}{button("Skip step", next, "secondary")}</>;
        break;
      }
      case "review":
        title = "Review your website preview";
        target = "preview-result";
        copy = <p>Look through your website preview to see your name, colors, and photos together. Sign in and save your changes here if you want to include them in an order.</p>;
        actions = <>
          {button("How to order", () => onAdvance({ editor: "packages" }))}
          {button("Keep editing", onExit, "secondary")}
        </>;
        break;
      case "packages":
        title = "Order your website";
        copy = <>{paymentInstructions}{contactDetails}</>;
        actions = <>
          <Link className="bloom-action bloom-primary" href={packagesHref} target="_blank" rel="noopener" onClick={onExit}>Compare packages in a new tab</Link>
          {contactAction}
        </>;
        break;
    }
  }

  return <BloomTutorialHint title={title} target={target} compactTarget={compactTarget}
    preferAbove={target === "preview-result" || !!compactTarget} onExit={onExit}
    onTargetChange={onTargetChange} actions={actions} fallback={fallback}>{copy}</BloomTutorialHint>;
}
