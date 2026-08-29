import type { ProductVariantWithImage, ProductWithImages } from "./catalog-data";

export type { Product, ProductVariant, ProductVariantWithImage, ProductWithImages } from "./catalog-data";
export {
  catalogProducts,
  products,
  getProduct,
  getVariant,
  getDefaultVariant,
  productFromPrice,
  variantCartLabel,
  enrichProduct,
  allVariants,
  migrateLegacyCartId,
  peso,
  pesoExact,
} from "./catalog-data";

export function variantImage(product: ProductWithImages, variant: ProductVariantWithImage): string {
  return variant.image ?? product.image;
}
