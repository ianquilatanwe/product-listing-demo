# UI standards report

FashionHub product listing · 2026-10-23 · production build (`npm run build && npm start`)

Checked with axe-core 4.10 (WCAG 2.2 AA + best practices) and Playwright: page,
skip link, Quick View, cart with Undo bar, empty, error and offline states, and
again with shortlisted / filtered / "✓ Added" states on screen; keyboard pass;
widths 320, 375, 768, 1440; touch device emulation; console.

**Result: axe 0 violations in every state. No Must failures.**

```
Must   ✅ 32  ❌ 0    Should ✅ 27  ⚠️ 3    Nice ✅ 4
```

## Accessibility (WCAG 2.2 AA)

✅ Text contrast: all text ≥ 4.5:1. The Figma greys `#98a2b3` (2.57:1) and `#c0c3c6` (1.77:1) were replaced with the kit's `#667085` (4.8:1); search placeholder `#475467` on the grey pill (6.5:1); "✓ Added" uses `#027a48` (5.7:1) and the "Shortlisted" label `#b42318` (6.5:1) instead of lighter greens/reds that failed
✅ Non-text contrast · focus ring `#3a4980`; heart icon 3.2:1 on its tint
✅ Not colour alone · "Shortlisted", "Out of stock", "✓ Added" in words
✅ Keyboard · ✅ Visible focus · ✅ Focus order · ✅ Labels and names · ✅ Alt text · ✅ Structure
✅ Status messages · cart count, results, offline banner, Undo bar
✅ Target size · ≥ 24px everywhere; 44px on touch screens (`pointer: coarse`)
✅ Reflow · no sideways scroll at 320px
✅ Modals · native `<dialog>`: focus moves in, Esc closes, focus returns to the card
✅ Errors · error and offline messages say what to do
✅ Skip link · first Tab stop, jumps to the products
✅ Reduced motion · animations are `motion-safe`
✅ Touch targets 44px
⚠️ Should · Text spacing · not tested
⚠️ Should · Screen reader spot check · not done (NVDA/VoiceOver pending)
— N/A · Focus not hidden: no sticky or fixed elements

## States

✅ Focus-visible · ✅ Disabled with reason (Out of stock, Max in cart, Go online to check out) · ✅ Loading/busy (Adding…, Placing order…)
✅ Hover · ✅ Active · ✅ Success · ✅ Selected (`aria-pressed`, `aria-current`)
✅ Loading skeletons · ✅ Empty with Clear filters · ✅ Error with Try again · ✅ Offline · ✅ Partial (uncached images fall back to a grey tile) · ✅ Long titles clamp to one line
— N/A · Field error: no forms

## Feedback and interaction

✅ Immediate response · ✅ Undo for cart Remove (6 s) · ✅ State in the URL (refresh, Back, shared links; `?page=99` clamps)
✅ Cart and shortlist saved on the device · ✅ Scroll to results after paging · ✅ Touch parity (tap the image for Quick View)
⚠️ Should · Affordance · header nav items from the design are static text that looks like links (no pages behind them in a one-page demo)

## Responsive, performance, resilience

✅ 320/375/768/1440, no horizontal scroll · ✅ Responsive images · ✅ Overlays fit phones
✅ CLS 0 · LCP 120 ms (local build; re-measure on the deployed URL) · ✅ Images and fonts optimised · ✅ No extra libraries
✅ Error boundary (`app/error.tsx`) · ✅ 10 s request timeout
✅ Service worker · ✅ Installable (manifest, 192/512/maskable icons, `theme-color`)
— N/A · Safe areas: no fixed bars

## Visual, content, SEO, security

✅ Matches the Figma frame (deliberate changes: darker greys/green/red for contrast, USD prices, footer credits)
✅ Design tokens in `globals.css` (`text-ink`, `bg-brand`, …) · ✅ Button labels · ✅ `Intl` money formatting · ✅ No dead ends
✅ Title + description · ✅ Social preview image · ✅ Custom favicon + `theme-color`
✅ No secrets · ✅ Remote images limited to the DummyJSON CDN
— N/A · External links in new tabs: links open in the same tab · Forms: only a search box (with a hidden label)

**Not checked:** screen reader, text-spacing override, real-device testing, Core Web Vitals on the deployed URL.
