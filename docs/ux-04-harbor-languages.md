# Harbor House language variants

The pilot now supports English (`lang=en`), Tagalog (`lang=tl`), and Taglish (`lang=taglish`) on all twelve page routes, including individual rooms, credits, contact, guestbook, and sample booking.

## Behavior

- Use the language selector inside the template or the workspace at `/preview/harbor-house`. Page links carry the selected language; shareable URLs and reloads restore it. Unknown language values fall back to English.
- Switching language changes content without remounting the booking flow. Selected rooms, dates, and entered details stay intact. Navigation between different pages follows normal page lifecycle behavior.
- The central `src/templates/harbor-house/translations.ts` dictionary contains paired Tagalog/Taglish entries keyed by English source copy. `language.tsx` supplies localized content, links, validation messages, document language/title, and the picker. No external translation service or browser DOM text replacement is used.
- Room identifiers, prices, URLs, asset credits, author names, and licence identifiers remain stable. Shared calendars accept optional locale/labels; other templates keep their defaults.
- Tagalog and Taglish documents use `fil` language metadata. Taglish is an editorial variant, not an invented language code. Baybloom storefront and preview-control copy remain English; this work localizes the template.
- Forms remain simulations. Contact, guestbook, and booking outcomes explicitly say that no message, publication, reservation, or charge occurred.

## Copy maintenance

Update both dictionary variants whenever adding an English message. Automated completeness checks cover explicit UI translation calls, room details, editorial content, and image descriptions. Proper place/business names are preserved. The Tagalog variant uses natural borrowed terms where needed rather than changing the meaning of foods or technical terms. The copy is authored draft translation, not independently reviewed: arrange fluent-speaker editorial review before publishing commercially.

## Packaging and release

The Harbor House source ZIP has been regenerated locally with the language files. The packer excludes storefront-only preview chrome. No production storage upload, seed, database migration, or deployment is performed. Upload the rebuilt archive through the normal release process alongside the storefront changes; existing hosted archives do not update automatically. Existing sample tier PDFs and service-package promises are outside this localization slice.

## Checks

`npm test` includes dictionary completeness checks. With the local production server on port 3100 and Chrome installed, run:

```sh
node --test tests/harbor-language.browser.mjs tests/harbor-preview.browser.mjs
```

The language browser check covers both variants on every page, mobile overflow, language-preserving links, validation, sample submission, booking state retained across language changes, confirmation translations, preview switching, and reload persistence. The existing preview checks also run against the localized workspace.

Validation completed: 30 regression/completeness tests passed; both browser suites passed; the storefront production build and independent exported-template build passed. A mobile visual review prompted shorter localized hero copy and a compact menu containing the booking action. Production delivery still requires deploying the source and uploading the rebuilt ZIP.
