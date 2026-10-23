# FashionHub – Product Listing (Figma → Next.js)

A Figma e-commerce design turned into a responsive Next.js + Tailwind page, wired to a live product API, with a working cart and offline support.

**Live demo:** _coming soon_

![Desktop](docs/desktop-top.png)

| Quick view | Cart | Offline |
| --- | --- | --- |
| ![Quick view](docs/quick-view.png) | ![Cart](docs/cart.png) | ![Offline](docs/offline.png) |

<img src="docs/mobile.png" alt="Mobile" width="280">

## What I built

**From the design**
- Matched the Figma "Product List Page" frame: header, promo banner, filter pills, product cards, pagination.
- Responsive from 375px phones to 1440px desktops (1 to 4 columns).

**Data**
- Loads ~200 products from [DummyJSON](https://dummyjson.com) in one request; search, category, sort, a shortlist filter and pagination all run in the browser.
- Card-shaped loading skeletons, an empty state with "Clear filters", and an error state with "Try again".

**Interactions**
- Hover: cards lift, images zoom, and the design's "Quick View" pill appears (also on keyboard focus).
- Quick View dialog with full description, discount and stock status.
- Cart drawer with quantity steppers, remove, subtotal and a demo checkout.
- "Buy Now" jumps to the headphones category.

**Button states**
- Add To Cart: idle → *Adding…* (spinner) → *✓ Added* → idle; disabled as *Out of stock* or *Max in cart*.
- Shortlist toggles (heart and button share state, with `aria-pressed`).
- Checkout: *Placing order…* → confirmation; disabled as *Go online to check out* while offline.
- Pagination and quantity buttons disable at their limits.

**Offline**
- A service worker ([`public/sw.js`](public/sw.js)) keeps the page, product data and viewed images. Once you have visited, the store reloads with no connection.
- Product data is network-first (fresh when online, saved copy when not); scripts and images are cache-first.
- Cart and shortlist are saved on the device, so they survive reloads and offline sessions.
- An offline banner appears when the connection drops, and data refreshes on reconnect.

**Accessibility**
- Native `<dialog>` (focus trap, Esc to close, focus returns to the card), labelled controls, visible focus rings, screen-reader text for cart count and ratings, reduced-motion support.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · `next/image` · Service Worker + Cache Storage. No extra libraries.

| File | What's in it |
| --- | --- |
| [`src/app/page.tsx`](src/app/page.tsx) | Page layout, data loading, filters, cart and shortlist state |
| [`src/components/ProductCard.tsx`](src/components/ProductCard.tsx) | Card, button states, stars, skeleton |
| [`src/components/Dialogs.tsx`](src/components/Dialogs.tsx) | Quick View and cart drawer |
| [`src/lib/hooks.ts`](src/lib/hooks.ts) | Online status, saved state, service worker registration |
| [`public/sw.js`](public/sw.js) | Offline caching |

## Run it

```bash
npm install
npm run build
npm start
```

Open http://localhost:3000. The service worker only runs in a production build. To try offline mode, load the page once, then switch DevTools → Network to **Offline** and reload.

## Credits

- Design: [Single Product & Product List Page](https://www.figma.com/community/file/1206898292713093171/single-product-product-list-page) by Kirit Goti, licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Changes: the static design was made interactive, prices show in USD, the footer placeholder became a credits footer, and the filter pills became search, category, shortlist and sort controls.
- Product data and images: [DummyJSON](https://dummyjson.com).

Built by [Ian Quilatan](https://github.com/ianquilatanwe), available for small frontend jobs [on Upwork](https://www.upwork.com/freelancers/~011c7ba66b3e0501a5).
