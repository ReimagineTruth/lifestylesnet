import { createServerFn } from "@tanstack/react-start";
import { dbGetProduct, dbListProducts } from "./db-mapper";

export const fetchProducts = createServerFn({ method: "GET" }).handler(async () => {
  return dbListProducts();
});

export const fetchProduct = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    return (await dbGetProduct(slug)) ?? null;
  });
