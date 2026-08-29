import { count } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { catalogProducts } from "@/lib/catalog-seed-data";
import * as schema from "./schema";

type Db = BetterSQLite3Database<typeof schema>;

function seedCatalog(db: Db) {
  for (const product of catalogProducts) {
    db.insert(schema.products).values({
      slug: product.slug,
      cateId: product.cateId,
      name: product.name,
      tagline: product.tagline,
      image: product.image,
      short: product.short,
      description: JSON.stringify(product.description),
      benefits: JSON.stringify(product.benefits),
      ingredients: product.ingredients,
      directions: product.directions,
    }).run();

    for (const variant of product.variants) {
      db.insert(schema.productVariants).values({
        id: variant.id,
        productSlug: product.slug,
        code: variant.code,
        label: variant.label,
        points: variant.points,
        price: variant.price,
        size: variant.size,
      }).run();
    }
  }
}

export async function seedIfEmpty(db: Db) {
  const [row] = await db.select({ value: count() }).from(schema.products);
  if (row && row.value > 0) return;
  seedCatalog(db);
}
