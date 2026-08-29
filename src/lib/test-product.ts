/** Slug for the internal ₱10 checkout test product — hide via Admin → Catalogue. */
export const TEST_PRODUCT_SLUG = "test-checkout";

export const TEST_PRODUCT_SETTING_KEY = "test_product_visible";

export function isTestProductSlug(slug: string) {
  return slug === TEST_PRODUCT_SLUG;
}

export function filterVisibleProducts<T extends { slug: string }>(
  list: T[],
  testProductVisible: boolean,
): T[] {
  if (testProductVisible) return list;
  return list.filter((p) => !isTestProductSlug(p.slug));
}
