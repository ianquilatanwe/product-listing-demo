// Run with `npm test` (Node's built-in runner; no test framework needed).
import assert from "node:assert/strict";
import { test } from "node:test";
import { browse, DEFAULT_VIEW, parseView, serializeView } from "./catalog.ts";
import type { Product } from "./products.ts";

const product = (id: number, extra: Partial<Product> = {}) =>
  ({ id, title: `Item ${id}`, price: id, rating: 5 - (id % 5), category: "beauty", ...extra }) as Product;

test("URL round-trips a view and omits defaults", () => {
  const view = { q: "lip", category: "beauty", sort: "price-desc" as const, shortlist: true, page: 3 };
  assert.equal(serializeView(DEFAULT_VIEW), "");
  assert.deepEqual(parseView(serializeView(view)), view);
});

test("bad URL values fall back to defaults", () => {
  assert.deepEqual(parseView("?sort=cheapest&page=-4"), DEFAULT_VIEW);
  assert.equal(parseView("?page=2.7").page, 2);
  assert.equal(parseView("?page=Infinity").page, 1);
});

test("browse filters, sorts, pages and clamps", () => {
  const all = [...Array.from({ length: 30 }, (_, i) => product(i + 1)), product(99, { category: "laptops", brand: "Lenovo" })];

  const laptops = browse(all, { ...DEFAULT_VIEW, category: "laptops" }, []);
  assert.deepEqual(laptops.visible.map((p) => p.id), [99]);

  assert.equal(browse(all, { ...DEFAULT_VIEW, q: "lenovo" }, []).total, 1);
  // Search matches the category as shown ("home decoration") and as its slug.
  const decor = [product(1, { category: "home-decoration" })];
  assert.equal(browse(decor, { ...DEFAULT_VIEW, q: "home decoration" }, []).total, 1);
  assert.equal(browse(decor, { ...DEFAULT_VIEW, q: "home-decoration" }, []).total, 1);
  assert.deepEqual(browse(all, { ...DEFAULT_VIEW, shortlist: true }, [2, 5]).visible.map((p) => p.id), [2, 5]);

  const cheapest = browse(all, { ...DEFAULT_VIEW, sort: "price-asc" }, []);
  assert.equal(cheapest.visible[0].id, 1);
  assert.equal(cheapest.visible.length, 12);

  const pastEnd = browse(all, { ...DEFAULT_VIEW, page: 99 }, []);
  assert.equal(pastEnd.page, 3);
  assert.equal(pastEnd.visible.length, 7);
});
