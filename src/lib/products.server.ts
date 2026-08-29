import { createServerFn } from "@tanstack/react-start";

export const fetchProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { dbListProducts } = await import("./db-mapper.server");
  return dbListProducts();
});

export const fetchProduct = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const { dbGetProduct } = await import("./db-mapper.server");
    return (await dbGetProduct(slug)) ?? null;
  });

export const loadProductForPageFn = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const { enrichProduct, getProduct } = await import("./catalog-data");
    const catalog = getProduct(slug);
    try {
      const { dbGetProduct } = await import("./db-mapper.server");
      const fromDb = await dbGetProduct(slug);
      if (fromDb) return enrichProduct(fromDb);
    } catch {
      // DB unavailable — use static catalog (edge deploy, missing data dir, etc.)
    }
    return catalog ?? null;
  });
