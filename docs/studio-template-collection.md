# Baybloom Studio template collection

The demos use Baybloom’s existing preview frame, image credits, gallery viewer and sample request forms. Each theme has its own entry, palette, typography and image set. Each template’s homepage opening and feature page live in `src/templates/<slug>/edition.tsx`. Footer information, navigation and section copy live in `src/templates/<slug>/site.ts`.

| Template | Reference patterns | Demo structure |
| --- | --- | --- |
| Fern & Stone | Overlapping prints, a photo-backed note and an editorial journal page. [Hotel social kit](https://www.etsy.com/listing/4445219803/instagram-templates-hotel-theme-set-of) | An arched garden photograph opens onto a morning or afternoon guest daybook. The social kit uses postcard, letter and journal compositions for the feed and stories. |
| Root & Kettle | Food close-ups, boxed text over photos and menu graphics. [Café and bakery kit](https://www.etsy.com/listing/4514479468/modern-cafe-bakery-instagram-templates) | A lunch counter poster leads to the menu and illustrated pairing tickets. The social kit uses a menu board, a food label and a framed notice. |
| Afterglow Rental | Centered masthead, uninterrupted banner photo, circular images and a three-column pricing section. [Live party rental demo](https://ccprinthouse.my.canva.site/party-rentals) | Evening running order → interactive lighting cue sheet → service grid → split approach → booking strip → pricing → event examples → FAQ → quote request. |
| Form & Field | Centered title over a large image, a welcome band and studio profile, and project-led sections. [Live coach demo](https://socialsatelier.my.canva.site/the-refined-growth-demo) · [Live portfolio demo](https://saudadefairecreativestudio.my.canva.site/natalie-london-portfolio-ugc-canva-website-template) | Project index → Northline identity case study → layered welcome and studio spreads → services → process → portfolio → FAQ → inquiry. |
| Plane & Light | Centered hero panel, alternating photo and text spreads, image triptych and asymmetric montage. [Photography portfolio](https://www.etsy.com/listing/4495994407/cinematic-wedding-photographer-website) | Architectural plate → selectable contact sheet → framed statement → studio profile → commission options → featured triptych → process → mosaic gallery → inquiry with two images. |
| Quiet Form | Image-led hero with a category strip, compact collection tiles, product grid and disclosure beside the products. [Live affiliate storefront](https://cheradesignstudio.my.canva.site/minimalistaffiliate) | Campaign spread → fabric library → collection links → six-product grid → essentials → lookbook → gift edit → care → about and disclosure. |
| Common Room | Offset interior photography and copy, amenities, property gallery, local highlights and booking. [Rental website](https://www.etsy.com/listing/1615125654/rental-home-website-template-canva) | Floor directory → studio comparison and cost estimator → split property introduction → amenities → studio and suite cards → gallery → neighborhood → policies → booking. |

The second hotel kit and the restaurant Instagram kit were unavailable. Their companion listings supplied the visual references for those two templates. Quiet Form uses the live Canva storefront link supplied for the affiliate reference.

## Catalog and source

The Studio catalog seed reads the collection metadata from `src/lib/studio-collection.json`. The preview URLs follow `/preview/<slug>`. Catalog screenshots and covers live in `public/images/designs/<slug>/`. Standalone archives are built into `storage/deliverables/<slug>/` by `scripts/pack-templates.mjs`. The pricing follows the existing source-only Starter tier, with amounts in the collection metadata.

The request forms demonstrate the flow using sample data. Quiet Form includes the collection and disclosure layout for configuring real partner links. The two social kits each export three 1080 × 1350 feed posts and three 1080 × 1920 stories. Their text, colors, image selection and layouts are editable in the website source.

## Image assets

OpenAI ImageGen generated the following photography and geometric artwork for Baybloom. Each template stores its WebP assets under `public/templates/<slug>/`, with descriptions and credits in `src/templates/<slug>/photos.json`. These are the generation prompts.

The expanded galleries use three additional prompt briefs.

- **Quiet Form campaign.** An original slow-fashion lookbook photograph in a warm olive plaster studio. Place a shoulders-down model in oatmeal linen and olive trousers on the right, beside a limestone table and folded slate knit. Leave subdued plaster on the left for white copy.
- **Quiet Form product details.** Photograph olive linen trousers, an undyed neck scarf, a coiled walnut belt and an oatmeal linen jacket individually. Use pale limestone, limewash and oatmeal paper, soft daylight and visible fibre texture.
- **Plane & Light courtyard.** A vertical architecture editorial looking across a shallow reflecting runnel at a two-storey limestone colonnade. Use a timber soffit, gray-green water, off-centre perspective and diffuse overcast light.

### Fern & Stone

```text
Use case: photorealistic-natural editorial asset contact sheet for a Baybloom website template. Produce ONE landscape image, a precise edge-to-edge 2 by 2 contact sheet with four distinct equal-sized photographs, perfectly aligned to the center x and y coordinates. No borders, gaps, frames, text, logos or watermarks. Each quadrant contains one complete self-contained photograph with margin around important subjects, suitable for clean automatic splitting and use as a standalone website image. Do not blend across panels. Quiet architecture for a boutique wellness retreat. Top left: wide outdoor pale limestone thermal pool among ferns and cedar buildings. Top right: woven spa treatment table in daylight with folded oat towels. Bottom left: close-up weathered stone basin, water reflecting olive tree leaves. Bottom right: airy private retreat room with gauze curtains and timber. Muted sage, oat, and warm limestone.
```

### Root & Kettle

```text
Use case: photorealistic-natural editorial asset contact sheet for a Baybloom website template. Produce ONE landscape image, a precise edge-to-edge 2 by 2 contact sheet with four distinct equal-sized photographs, perfectly aligned to the center x and y coordinates. No borders, gaps, frames, text, logos or watermarks. Each quadrant contains one complete self-contained photograph with margin around important subjects, suitable for clean automatic splitting and use as a standalone website image. Do not blend across panels. Specialty brew bar and plant-based kitchen editorial. Top left: restaurant-table overhead three-quarter shot of a colorful seasonal vegetable spread with herbs and pale peach table linens. Top right: tahini squash and lentil dish with herbs, close-up. Bottom left: iced filter coffee in a fluted glass alongside a hot pour-over carafe. Bottom right: ceramic matcha whisking bowl beside an iced matcha and fresh mint. Dusty garnet, pale cream and moss-green, afternoon natural light.
```

### Afterglow Rental

```text
Use case: photorealistic-natural editorial asset contact sheet for a Baybloom website template. Produce ONE landscape image, a precise edge-to-edge 2 by 2 contact sheet with four distinct equal-sized photographs, perfectly aligned to the center x and y coordinates. No borders, gaps, frames, text, logos or watermarks. Each quadrant contains one complete self-contained photograph with margin around important subjects, suitable for clean automatic splitting and use as a standalone website image. Do not blend across panels. High-end event lighting and furniture editorial. Top left: wide dusk scene of an elegant industrial hall with hard architectural shell, cream modular lounge seating and glowing concealed uplights. Top right: amber lighting washes traced over masonry columns at night. Bottom left: intimate oatmeal velvet armchairs and low cocktail tables in a shadowy evening lounge. Bottom right: styled long communal reception table with amber lights and minimal floral stems. Deep fig, chocolate, amber and parchment, no tents.
```

```text
One edge-to-edge landscape photograph, 3:2. A real high-end evening event design in a wide industrial hall with tall arched windows and exposed wooden roof beams: modular cream velvet lounge seating, low tables, slender florals, polished stone floor, carefully concealed amber uplights washing the vertical pillars at dusk. Seat grouping in middle and right, deep warm shadows on left for page overlay. Deep fig, amber and parchment. Architectural editorial photography, subtle grain, no people, signs, logos, frames or text.
```

### Form & Field

```text
Use case: photorealistic-natural editorial asset contact sheet for a Baybloom website template. Produce ONE landscape image, a precise edge-to-edge 2 by 2 contact sheet with four distinct equal-sized photographs, perfectly aligned to the center x and y coordinates. No borders, gaps, frames, text, logos or watermarks. Each quadrant contains one complete self-contained photograph with margin around important subjects, suitable for clean automatic splitting and use as a standalone website image. Do not blend across panels. Abstract geometric design agency portfolio artwork. Top left: monumental off-white interlocking tubular sculpture with cobalt geometric slabs and sculptural hard shadows, intended as wide hero. Top right: editorial rhythmic black and cobalt circular forms on pale cream paper. Bottom left: warm vermilion rectangular folded paper pieces, offset layers, typographic-style composition without characters. Bottom right: silver metallic curved panels meeting black and white planes, subtle paper grain. Art-directed modernist design, no portraits or text.
```

### Plane & Light

```text
Use case: photorealistic-natural editorial asset contact sheet for a Baybloom website template. Produce ONE landscape image, a precise edge-to-edge 2 by 2 contact sheet with four distinct equal-sized photographs, perfectly aligned to the center x and y coordinates. No borders, gaps, frames, text, logos or watermarks. Each quadrant contains one complete self-contained photograph with margin around important subjects, suitable for clean automatic splitting and use as a standalone website image. Do not blend across panels. Architecture photography studio editorial in neutral tones. Top left: wide frontal architectural photograph of a pale concrete modernist building in oblique afternoon light, monumental column framing. Top right: a quiet neutral gallery interior with translucent curtain and white oak bench. Bottom left: geometric desert concrete exterior with a low silver olive tree. Bottom right: detail of curved blackened steel handrail on beige plaster stair, shadows and precise joins. Subtle fine grain, straight vertical lines, no people.
```

```text
One edge-to-edge landscape photograph, 3:2. Large modernist pale concrete pavilion in late afternoon light, wide frontal architectural editorial photograph. Monumental pale concrete columns and angular cantilever with strong oblique shadows; dark glass between columns, tree canopy in upper left, warm gray stone ground. Lower left in shade and right sunlit, framed wide for a website cover. Deliberate straight verticals, real materials and subtle fine grain, natural neutral tones, no text, people or branding.
```

### Quiet Form

```text
Use case: photorealistic-natural editorial asset contact sheet for a Baybloom website template. Produce ONE landscape image, a precise edge-to-edge 2 by 2 contact sheet with four distinct equal-sized photographs, perfectly aligned to the center x and y coordinates. No borders, gaps, frames, text, logos or watermarks. Each quadrant contains one complete self-contained photograph with margin around important subjects, suitable for clean automatic splitting and use as a standalone website image. Do not blend across panels. Slow-fashion label editorial and product imagery for a minimalist wardrobe. Top left: editorial portrait of model in a relaxed oatmeal linen shirt and olive trousers beside a raw plaster wall, framed shoulders to shin, no facial emphasis. Top right: natural linen button-front shirt on a plain warm-gray studio backdrop. Bottom left: bone-colored structured cotton canvas tote on pale stone, photographed at a slight angle. Bottom right: close-up of folded slate-blue textured organic cotton knit on an oat-colored surface. Warm cream, olive, soft gray, detailed real textiles, natural daylight.
```

### Common Room

```text
Use case: photorealistic-natural editorial asset contact sheet for a Baybloom website template. Produce ONE landscape image, a precise edge-to-edge 2 by 2 contact sheet with four distinct equal-sized photographs, perfectly aligned to the center x and y coordinates. No borders, gaps, frames, text, logos or watermarks. Each quadrant contains one complete self-contained photograph with margin around important subjects, suitable for clean automatic splitting and use as a standalone website image. Do not blend across panels. Modern co-living and urban studio rentals editorial. Top left: warm modern apartment lobby and shared lounge with honey timber, slim metal windows and natural modern furniture. Top right: compact furnished urban studio with desk, queen bed and city windows. Bottom left: sunny private suite with restful deep-blue headboard, oatmeal covers and high windows. Bottom right: shared coworking room with long walnut table, slim lamps and indoor trees. Rust, espresso and cream, realistic light, no people.
```
