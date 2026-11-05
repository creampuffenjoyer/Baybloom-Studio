# Still Water Spa UX and language work

The treatment finder filters by type and offered duration and carries the selected option into a sample appointment. A dedicated preview includes page and device controls. Booking, gift and newsletter outcomes identify themselves as samples.

Tagalog and Taglish treatment names and descriptions are draft copy in `src/templates/still-water-spa/treatment-translations.ts`; finder and booking interface copy is in `booking-translations.ts`. The site and preview do not display a language selector. Direct links with a draft language parameter remain supported and display a notice that the translation is partial. Other page copy, packages, navigation, validation and photo descriptions still need translation. Have a fluent speaker review the drafts before publication.

Finder and translation coverage tests, lint, TypeScript, the production Next.js build, and browser checks for language switching, duration handoff and preservation of booking form values passed. The source ZIP was refreshed; it has not had a separate standalone build.
