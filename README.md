# FashionHub – Product Listing (Figma → Next.js)

A Figma e-commerce design turned into a responsive Next.js + Tailwind page, wired to a live product API.

**Live demo:** _coming soon_

![Desktop](docs/desktop-top.png)

<img src="docs/mobile.png" alt="Mobile" width="280">

## What I built

- Pixel-matched the Figma "Product List Page" frame: header, promo banner, filter pills, product cards, pagination.
- Loads ~200 products from [DummyJSON](https://dummyjson.com) in one request, then searches, filters by category, sorts and paginates (12 per page) in the browser.
- Loading skeletons, an empty state with "Clear filters", and an error state with "Try again".
- Add To Cart updates the header badge; the heart and Add Shortlist share one toggle.
- Responsive from 375px phones to 1440px desktops: 1, 2, 3 or 4 columns.
- Accessible: labelled search and selects, keyboard focus rings, screen-reader text for the cart count and star ratings.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · `next/image`

The whole page is in [`src/app/page.tsx`](src/app/page.tsx); shared styles from the design are in [`src/app/globals.css`](src/app/globals.css).

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Credits

- Design: [Single Product & Product List Page](https://www.figma.com/community/file/1206898292713093171/single-product-product-list-page) by Kirit Goti, licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Changes: the static design was made interactive, prices show in USD, the footer placeholder became a credits footer, and the filter pills became search, category and sort controls.
- Product data and images: [DummyJSON](https://dummyjson.com).

Built by [Ian Quilatan](https://github.com/ianquilatanwe), available for small frontend jobs [on Upwork](https://www.upwork.com/freelancers/~011c7ba66b3e0501a5).
