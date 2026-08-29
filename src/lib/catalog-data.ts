import intraImg from "@/assets/bottle_INTRA.png";
import nutriaImg from "@/assets/nutriaplus.png";
import cardioImg from "@/assets/cardiolife.png";
import fibreImg from "@/assets/fibrelife.png";
import {
  catalogProducts as seedCatalog,
  type Product,
  type ProductVariant,
} from "@/lib/catalog-seed-data";

export type { Product, ProductVariant };

const imageBySlug: Record<string, string> = {
  intra: intraImg,
  "nutria-plus": nutriaImg,
  cardiolife: cardioImg,
  fibrelife: fibreImg,
  "better-together-pack": intraImg,
};

export const catalogProducts: Product[] = seedCatalog.map((product) => ({
  ...product,
  image: imageBySlug[product.slug] ?? product.image,
}));

export const products = catalogProducts;

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export function getVariant(variantId: string) {
  for (const product of products) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) return { product, variant };
  }
  return undefined;
}

export function getDefaultVariant(product: Product) {
  return product.variants[0]!;
}

export function productFromPrice(product: Product) {
  return Math.min(...product.variants.map((v) => v.price));
}

export function variantCartLabel(product: Product, variant: ProductVariant) {
  return `${product.name} (${variant.label})`;
}

export function allVariants() {
  return products.flatMap((product) =>
    product.variants.map((variant) => ({ product, variant })),
  );
}

const LEGACY_SLUG_TO_VARIANT: Record<string, string> = {
  intra: "intra-1201ph",
  "nutria-plus": "nutria-plus-1502ph",
  cardiolife: "cardiolife-1540ph",
  fibrelife: "fibrelife-1038ph",
};

export function migrateLegacyCartId(id: string) {
  return LEGACY_SLUG_TO_VARIANT[id] ?? id;
}

export const peso = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);

export const pesoExact = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
