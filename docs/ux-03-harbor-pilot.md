# Harbor House pilot — first implementation slice

Implemented the preview and product-information slice of the UX plan.

- `/preview/harbor-house` provides page shortcuts, desktop/mobile viewport controls, an open-full-preview link, and a return to package details.
- Page/device choices are saved in the URL for reloads and sharing. Internal demo navigation updates the selected page. Page destinations are allowlisted; iframe messages must come from the actual same-origin preview frame.
- Small screens use their native width. Toolbar space is reserved above the frame. Direct Harbor House demos use an in-flow notice instead of the overlapping floating sales bar.
- The product detail links into the workspace and explains business fit, source delivery, English availability, and required integrations.
- The booking introduction, final action, and confirmation explicitly describe a simulation. Exported template source retains these honest sample states until the buyer integrates real services.

Pricing and access rules remain unchanged. The commercial distinction between packages still needs resolution; this change does not deliver or validate the existing advertised customization/payment/multilanguage services. Download ZIPs and seeded guides have not been regenerated or replaced.

The language slice is now implemented; see [Harbor House language variants](ux-04-harbor-languages.md). Other template previews have not been migrated to the workspace.

## Validation

Production build (152 generated pages), lint, and the local Chrome regression check passed. The browser check covers internal navigation followed by reselecting a previously loaded page, preserving the iframe document when changing device width, reload persistence, 360/390px layout without toolbar overlap, direct demo controls, and rejecting arbitrary preview destinations. The mobile preview was also visually inspected.

To rerun: start the production build locally on port 3100, then run `node --test tests/harbor-preview.browser.mjs`. Chrome must be installed; `PREVIEW_BASE` can override the local address. This check is separate from the default unit suite and does not submit bookings or payments.
