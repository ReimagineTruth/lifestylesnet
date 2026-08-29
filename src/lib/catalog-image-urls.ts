/** Official Lifestyles single-bottle photos (650px PNG on lifestyles.net). */
export const LIFESTYLES_IMG = "https://www.lifestyles.net/includes/imgs";

/** PBC shop thumbnail source — 125×125 only; used when regenerating /public/bundles assets. */
export const PBC_PHOTO = "https://pbc.lifestyles.net/includes/shop/PH/photo";

/** High-res bundle images upscaled from official PBC photos (480×480 PNG). */
const BUNDLE_IMG = "/bundles";

export const productImageUrls: Record<string, string> = {
  intra: `${BUNDLE_IMG}/intra-1201ph.png`,
  "nutria-plus": `${BUNDLE_IMG}/nutria-1502ph.png`,
  cardiolife: `${BUNDLE_IMG}/cardio-1540ph.png`,
  fibrelife: `${BUNDLE_IMG}/fibre-1038ph.png`,
  "better-together-pack": `${BUNDLE_IMG}/btp-6999.jpg`,
  "test-checkout": `${BUNDLE_IMG}/intra-1201ph.png`,
};

/** Maps catalog imageKey → display URL. Singles and bundles use local 480px PNGs in /public/bundles. */
export const bundleImageUrls: Record<string, string> = {
  "intra-1201ph": `${BUNDLE_IMG}/intra-1201ph.png`,
  "intra-1201": `${BUNDLE_IMG}/intra-1201.jpg`,
  "intra-1231": `${BUNDLE_IMG}/intra-1231.png`,
  "intra-1232": `${BUNDLE_IMG}/intra-1232.png`,
  "intra-1234": `${BUNDLE_IMG}/intra-1234.png`,
  "nutria-1502ph": `${BUNDLE_IMG}/nutria-1502ph.png`,
  "nutria-1502": `${BUNDLE_IMG}/nutria-1502.png`,
  "cardio-1540ph": `${BUNDLE_IMG}/cardio-1540ph.png`,
  "cardio-1540": `${BUNDLE_IMG}/cardio-1540.png`,
  "fibre-1038ph": `${BUNDLE_IMG}/fibre-1038ph.png`,
  "fibre-1038": `${BUNDLE_IMG}/fibre-1038.png`,
  "test-checkout-10ph": `${BUNDLE_IMG}/intra-1201ph.png`,
  "btp-6999": `${BUNDLE_IMG}/btp-6999.jpg`,
  "btp-6999c": `${BUNDLE_IMG}/btp-6999c.jpg`,
};

export function pbcPhotoUrl(code: string) {
  return `${PBC_PHOTO}/${code}.jpg`;
}
