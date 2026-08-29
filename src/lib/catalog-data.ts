import { bundleImageUrls, productImageUrls } from "@/lib/catalog-image-urls";
import {
  catalogProducts as seedCatalog,
  type Product,
  type ProductVariant,
} from "@/lib/catalog-seed-data";

export type ProductVariantWithImage = ProductVariant & { image?: string };
export type ProductWithImages = Omit<Product, "variants"> & {
  variants: ProductVariantWithImage[];
};

export type { Product, ProductVariant };

function resolveVariant(variant: ProductVariant): ProductVariantWithImage {
  const image = variant.imageKey ? bundleImageUrls[variant.imageKey] : undefined;
  return image ? { ...variant, image } : { ...variant };
}

function resolveProduct(product: Product): ProductWithImages {
  const variants = product.variants.map(resolveVariant);
  const defaultVariant = variants[0];
  return {
    ...product,
    image: defaultVariant?.image ?? productImageUrls[product.slug] ?? product.image,
    variants,
  };
}

export const catalogProducts: ProductWithImages[] = seedCatalog.map(resolveProduct);

export const products = catalogProducts;

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

const LEGACY_VARIANT_IDS: Record<string, string> = {
  "btp-8999": "btp-6999",
};

const LEGACY_VARIANT_CODES: Record<string, string> = {
  "8999": "6999",
};

const LEGACY_SLUG_TO_VARIANT: Record<string, string> = {
  intra: "intra-1201ph",
  "nutria-plus": "nutria-plus-1502ph",
  cardiolife: "cardiolife-1540ph",
  fibrelife: "fibrelife-1038ph",
};

function resolveVariantId(variantId: string) {
  return LEGACY_VARIANT_IDS[variantId] ?? LEGACY_SLUG_TO_VARIANT[variantId] ?? variantId;
}

function findCatalogVariant(resolved: ProductWithImages, variant: ProductVariant) {
  const legacyId = LEGACY_VARIANT_IDS[variant.id];
  const legacyCode = LEGACY_VARIANT_CODES[variant.code];
  return (
    resolved.variants.find((v) => v.id === variant.id) ??
    (legacyId ? resolved.variants.find((v) => v.id === legacyId) : undefined) ??
    resolved.variants.find((v) => v.code === variant.code) ??
    (legacyCode ? resolved.variants.find((v) => v.code === legacyCode) : undefined)
  );
}

/** Merge DB/catalog product rows with bundled variant images from the client catalog. */
export function enrichProduct(product: Product): ProductWithImages {
  const resolved = getProduct(product.slug);
  if (!resolved) return resolveProduct(product);

  return {
    ...resolved,
    ...product,
    image: resolved.image,
    short: resolved.short,
    description: resolved.description,
    benefits: resolved.benefits,
    ingredients: resolved.ingredients,
    directions: resolved.directions,
    ...(resolved.resources != null ? { resources: resolved.resources } : {}),
    ...(resolved.faqs != null ? { faqs: resolved.faqs } : {}),
    variants: product.variants.map((variant) => {
      const catalogVariant = findCatalogVariant(resolved, variant);
      if (!catalogVariant) return resolveVariant(variant);
      return {
        ...catalogVariant,
        ...variant,
        ...(catalogVariant.image ? { image: catalogVariant.image } : {}),
      };
    }),
  };
}

export function variantImage(product: ProductWithImages, variant: ProductVariantWithImage) {
  return variant.image ?? product.image;
}

export function getVariant(variantId: string) {
  const id = resolveVariantId(variantId);
  for (const product of products) {
    const variant = product.variants.find((v) => v.id === id);
    if (variant) return { product, variant };
  }
  return undefined;
}

export function getDefaultVariant(product: ProductWithImages) {
  const variant = product.variants[0];
  if (!variant) throw new Error(`Product "${product.slug}" has no variants`);
  return variant;
}

export function productFromPrice(product: ProductWithImages) {
  return Math.min(...product.variants.map((v) => v.price));
}

export function variantCartLabel(product: ProductWithImages, variant: ProductVariantWithImage) {
  return `${product.name} (${variant.label})`;
}

export function allVariants() {
  return products.flatMap((product) => product.variants.map((variant) => ({ product, variant })));
}

export function migrateLegacyCartId(id: string) {
  return resolveVariantId(id);
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
