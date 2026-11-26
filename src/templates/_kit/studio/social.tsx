"use client";

import { useEffect, useRef, useState } from "react";
import type { SocialDesign, StudioPhoto, StudioSite } from "./types";

const width = 1080;

function cover(context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  context.drawImage(image, (image.naturalWidth - sw) / 2, (image.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
}

function textLines(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  return [...lines, line];
}

function printPhoto(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, w: number, h: number, rotation = 0) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rotation * Math.PI / 180);
  ctx.fillStyle = "#fffaf0";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  cover(ctx, image, -w / 2 + 15, -h / 2 + 15, w - 30, h - 70);
  ctx.restore();
}

function paperCopy(ctx: CanvasRenderingContext2D, site: StudioSite, design: SocialDesign, x: number, y: number, w: number, options: { center?: boolean; compact?: boolean } = {}) {
  const { center = false, compact = false } = options;
  const lineHeight = compact ? 60 : 80;
  const left = center ? x + w / 2 : x;
  ctx.save();
  ctx.fillStyle = site.theme.ink;
  ctx.textAlign = center ? "center" : "left";
  ctx.font = "700 26px Arial, sans-serif";
  ctx.fillText(design.label.toUpperCase(), left, y, w);
  ctx.font = site.variant === "kitchen" ? `800 ${lineHeight}px Arial, sans-serif` : `${lineHeight + 4}px Georgia, serif`;
  const titleLines = textLines(ctx, design.headline, w);
  titleLines.forEach((line, index) => ctx.fillText(line, left, y + 42 + index * lineHeight, w));
  ctx.font = `${compact ? 29 : 34}px Arial, sans-serif`;
  textLines(ctx, design.caption, w).forEach((line, index) => ctx.fillText(line, left, y + titleLines.length * lineHeight + 55 + index * 38, w));
  ctx.restore();
}

function drawArtwork(ctx: CanvasRenderingContext2D, image: HTMLImageElement, supporting: HTMLImageElement[], site: StudioSite, design: SocialDesign, h: number) {
  const [second = image, third = second] = supporting;
  const { paper, accent, ink, onAccent, surface } = site.theme;
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, width, h);
  switch (design.layout) {
    case "postcards":
      ctx.fillStyle = accent;
      ctx.fillRect(0, 0, width, h);
      ctx.fillStyle = onAccent;
      ctx.font = "700 31px Arial, sans-serif";
      ctx.fillText(site.name.toUpperCase(), 68, 60, 660);
      printPhoto(ctx, image, 105, h * .18, 590, h * .40, -12);
      printPhoto(ctx, second, 485, h * .26, 470, h * .37, 10);
      printPhoto(ctx, third, 150, h * .45, 370, h * .27, -5);
      ctx.fillStyle = "#fffaf0";
      ctx.fillRect(170, h * .66, 780, h * .26);
      paperCopy(ctx, site, design, 220, h * .685, 680, { center: true, compact: true });
      return;
    case "letter": {
      cover(ctx, image, 0, 0, width, h);
      ctx.fillStyle = "#232b2590";
      ctx.fillRect(0, 0, width, h);
      const top = h * .31;
      ctx.fillStyle = paper;
      ctx.fillRect(128, top, 824, h * .39);
      ctx.fillStyle = accent;
      ctx.fillRect(128, top, 824, 16);
      ctx.strokeStyle = accent;
      ctx.strokeRect(156, top + 36, 768, h * .39 - 62);
      ctx.fillStyle = ink;
      ctx.font = "700 27px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(site.name.toUpperCase(), width / 2, top + 74, 690);
      ctx.textAlign = "left";
      paperCopy(ctx, site, design, 208, top + 150, 664, { center: true });
      return;
    }
    case "journal": {
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.strokeRect(48, 52, width - 96, h - 104);
      ctx.fillStyle = ink;
      ctx.font = "italic 48px Georgia, serif";
      ctx.fillText(site.name, 88, 86, 850);
      ctx.strokeRect(88, 158, 904, 1);
      printPhoto(ctx, image, 102, 210, 580, h * .34, -2);
      printPhoto(ctx, second, 632, h * .23, 340, h * .25, 6);
      paperCopy(ctx, site, design, 90, h * .57, 900);
      return;
    }
    case "label": {
      cover(ctx, image, 0, 0, width, h);
      ctx.fillStyle = "#20191350";
      ctx.fillRect(0, 0, width, h);
      ctx.fillStyle = surface;
      ctx.fillRect(90, h * .48, 740, h * .39);
      ctx.fillStyle = accent;
      ctx.fillRect(90, h * .48, 740, 12);
      paperCopy(ctx, site, design, 143, h * .525, 628, { compact: true });
      return;
    }
    case "menu-board":
      ctx.fillStyle = accent;
      ctx.fillRect(0, 0, width, 128);
      ctx.fillStyle = onAccent;
      ctx.font = "700 32px Arial, sans-serif";
      ctx.fillText(site.name.toUpperCase(), 74, 54, 910);
      [image, second, third].forEach((photo, index) => {
        cover(ctx, photo, 680, h * (.2 + index * .23), 325, h * .2);
      });
      ctx.strokeStyle = accent;
      ctx.strokeRect(74, h * .23, 504, 2);
      paperCopy(ctx, site, design, 74, h * .31, 500, { compact: true });
      return;
    case "photo-notice":
      ctx.fillStyle = site.theme.deep;
      ctx.fillRect(0, 0, width, h);
      cover(ctx, image, 65, 65, 950, h - 130);
      ctx.fillStyle = "#fffaf0";
      ctx.fillRect(138, h * .23, 804, h * .43);
      ctx.fillStyle = accent;
      ctx.font = "700 30px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(site.name.toUpperCase(), width / 2, h * .275, 690);
      ctx.textAlign = "left";
      paperCopy(ctx, site, design, 202, h * .335, 676, { center: true });
      return;
  }
}

function paint(canvas: HTMLCanvasElement, image: HTMLImageElement, supporting: HTMLImageElement[], site: StudioSite, design: SocialDesign) {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");
  context.textBaseline = "top";
  drawArtwork(context, image, supporting, site, design, canvas.height);
}

function SocialTile({ site, design, photo, supporting }: { site: StudioSite; design: SocialDesign; photo: StudioPhoto; supporting: StudioPhoto[] }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    const images = [photo, ...supporting].map(({ src }) => {
      const image = new Image();
      image.src = src;
      return image;
    });
    void Promise.all(images.map((image) => image.decode())).then(() => {
      if (!active || !canvas.current) return;
      paint(canvas.current, images[0], images.slice(1), site, design);
      setReady(true);
    }).catch(() => { if (active) setMessage("The artwork could not load."); });
    return () => { active = false; };
  }, [design, photo, site, supporting]);

  function download() {
    canvas.current?.toBlob((file) => {
      if (!file) {
        setMessage("The PNG could not be saved.");
        return;
      }
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${site.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${design.id}.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage("PNG downloaded.");
    }, "image/png");
  }

  return (
    <figure className="st-social-item">
      <canvas ref={canvas} width={width} height={design.format === "post" ? 1350 : 1920} role="img" aria-label={`${design.label}. ${design.headline}. ${design.caption}. Image: ${photo.alt}`} />
      <figcaption><strong>{design.label}</strong><button className="st-text-link" type="button" onClick={download} disabled={!ready} aria-label={`Download ${design.label} ${design.format} PNG`}>Download PNG <span aria-hidden="true">↓</span></button></figcaption>
      <p role="status" className="text-sm">{message}</p>
    </figure>
  );
}

export function StudioSocial({ site, photos }: { site: StudioSite; photos: Record<string, StudioPhoto> }) {
  return (
    <section className="st-wrap st-social" aria-labelledby="studio-social-title">
      <h1 id="studio-social-title">Social kit</h1>
      <p>Instagram feed artwork and stories for {site.name}. Download each design as a PNG.</p>
      {(["post", "story"] as const).map((format) => (
        <section className="st-social-group" key={format} aria-labelledby={`${format}-group`}>
          <h2 id={`${format}-group`}>{format === "post" ? "Feed posts · 4:5" : "Stories · 9:16"}</h2>
          <div className="st-social-grid">
            {site.social?.filter((design) => design.format === format).map((design) => <SocialTile key={design.id} site={site} design={design} photo={photos[design.photo]} supporting={(design.supportingPhotos ?? []).map((id) => photos[id])} />)}
          </div>
        </section>
      ))}
    </section>
  );
}
