export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  availabilityStatus: "In Stock" | "Low Stock" | "Out of Stock";
  category: string;
  brand?: string;
  thumbnail: string;
  images: string[];
};

// limit=0 returns the whole catalogue (~200 items), so search, category,
// sort and pagination all run in the browser on a single request.
export const PRODUCTS_URL =
  "https://dummyjson.com/products?limit=0&select=title,description,price,discountPercentage,rating,stock,availabilityStatus,category,brand,thumbnail,images";

export const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export const label = (slug: string) => slug.replace(/-/g, " ");
