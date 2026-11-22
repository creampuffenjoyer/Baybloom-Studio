# Isla Verde UX and languages

The story and rooms pages include a finder for guest count and setting. Booking links carry the room and guest count into the sample flow. Booking and inquiry outcomes explain that no reservation or message is sent.

The preview at `/preview/isla-verde-boutique` offers page and device controls and English, Tagalog and Taglish. Language selection preserves the current URL parameters and in-progress form values. Taglish uses Filipino document language metadata. Translation copy is maintained in `translations.ts`, `content-copy.ts`, and `photo-copy.ts`; proper names, slugs, option values, currency, and photo attribution stay stable. Tagalog and Taglish copy should receive fluent editorial review before publication.

The source package is `storage/deliverables/isla-verde-boutique/isla-verde-boutique-source.zip`. The production build and language coverage, mobile route, preview, booking, and inquiry browser checks passed. The package was regenerated; a separate standalone installation and build was not performed.
