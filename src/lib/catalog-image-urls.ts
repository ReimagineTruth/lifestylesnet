/** Official Lifestyles single-bottle photos (650px PNG on lifestyles.net). */
export const LIFESTYLES_IMG = "https://www.lifestyles.net/includes/imgs";

/** PBC shop thumbnail source — 125×125 only; used when regenerating /public/bundles assets. */
export const PBC_PHOTO = "https://pbc.lifestyles.net/includes/shop/PH/photo";

/** High-res bundle images upscaled from official PBC photos (480×480 PNG). */
const BUNDLE_IMG = "/bundles";

export const productImageUrls: Record<string, string> = {
  intra: `${LIFESTYLES_IMG}/bottle_INTRA.png`,
  "nutria-plus": `${LIFESTYLES_IMG}/bottle_NP.png`,
  cardiolife: `${LIFESTYLES_IMG}/bottle_CL.png`,
  fibrelife: `${LIFESTYLES_IMG}/bottle_FL.png`,
  "better-together-pack": `${BUNDLE_IMG}/btp-6999.png`,
};

/** Maps catalog imageKey → display URL. Singles use lifestyles.net; bundles use local 480px PNGs. */
export const bundleImageUrls: Record<string, string> = {
  "intra-1201ph": `${LIFESTYLES_IMG}/bottle_INTRA.png`,
  "intra-1201": `${BUNDLE_IMG}/intra-1201.png`,
  "intra-1231": `${BUNDLE_IMG}/intra-1231.png`,
  "intra-1232": `${BUNDLE_IMG}/intra-1232.png`,
  "intra-1234": `${BUNDLE_IMG}/intra-1234.png`,
  "nutria-1502ph": `${LIFESTYLES_IMG}/bottle_NP.png`,
  "nutria-1502": `${BUNDLE_IMG}/nutria-1502.png`,
  "cardio-1540ph": `${LIFESTYLES_IMG}/bottle_CL.png`,
  "cardio-1540": `${BUNDLE_IMG}/cardio-1540.png`,
  "fibre-1038ph": `${LIFESTYLES_IMG}/bottle_FL.png`,
  "fibre-1038": `${BUNDLE_IMG}/fibre-1038.png`,
  "btp-6999": `${BUNDLE_IMG}/btp-6999.png`,
  "btp-6999c": `${BUNDLE_IMG}/btp-6999c.png`,
};

export function pbcPhotoUrl(code: string) {
  return `${PBC_PHOTO}/${code}.jpg`;
}
