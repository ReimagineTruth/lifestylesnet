import { count, eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { catalogProducts } from "@/lib/catalog-seed-data";
import { TEST_PRODUCT_SETTING_KEY, TEST_PRODUCT_SLUG } from "@/lib/test-product";
import * as schema from "./schema";

type Db = BetterSQLite3Database<typeof schema>;

function insertProduct(db: Db, product: (typeof catalogProducts)[number]) {
  db.insert(schema.products)
    .values({
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
    })
    .run();

  for (const variant of product.variants) {
    db.insert(schema.productVariants)
      .values({
        id: variant.id,
        productSlug: product.slug,
        code: variant.code,
        label: variant.label,
        points: variant.points,
        price: variant.price,
        size: variant.size,
      })
      .run();
  }
}

function seedCatalog(db: Db) {
  for (const product of catalogProducts) {
    insertProduct(db, product);
  }
}

export async function ensureTestProductCatalog(db: Db) {
  const [existing] = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.slug, TEST_PRODUCT_SLUG));
  if (existing) return;

  const testProduct = catalogProducts.find((p) => p.slug === TEST_PRODUCT_SLUG);
  if (!testProduct) return;
  insertProduct(db, testProduct);
}

export async function ensureDefaultSettings(db: Db) {
  const [existing] = await db
    .select()
    .from(schema.appSettings)
    .where(eq(schema.appSettings.key, TEST_PRODUCT_SETTING_KEY));
  if (existing) return;
  await db.insert(schema.appSettings).values({
    key: TEST_PRODUCT_SETTING_KEY,
    value: "true",
  });
}

export async function seedIfEmpty(db: Db) {
  const [row] = await db.select({ value: count() }).from(schema.products);
  if (row && row.value > 0) {
    await ensureTestProductCatalog(db);
    await ensureDefaultSettings(db);
    return;
  }
  seedCatalog(db);
  await ensureDefaultSettings(db);
}
