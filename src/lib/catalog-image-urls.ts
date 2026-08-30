/** Official Lifestyles single-bottle photos (650px PNG on lifestyles.net). */
export const LIFESTYLES_IMG = "https://www.lifestyles.net/includes/imgs";
const INTRA_BOTTLE_IMG = `${LIFESTYLES_IMG}/bottle_INTRA.png`;
const CARDIOLIFE_BOTTLE_IMG = `${LIFESTYLES_IMG}/bottle_CL_euczpl.png`;

/** PBC shop thumbnail source — 125×125 only; used when regenerating /public/bundles assets. */
export const PBC_PHOTO = "https://pbc.lifestyles.net/includes/shop/PH/photo";

/** High-res bundle images upscaled from official PBC photos (480×480 PNG). */
const BUNDLE_IMG = "/bundles";

export const productImageUrls: Record<string, string> = {
  intra: INTRA_BOTTLE_IMG,
  "nutria-plus": `${BUNDLE_IMG}/nutria-1502ph.png`,
  cardiolife: CARDIOLIFE_BOTTLE_IMG,
  fibrelife: `${BUNDLE_IMG}/fibre-1038ph.png`,
  "better-together-pack": `${BUNDLE_IMG}/btp-6999.jpg`,
  "test-checkout": `${BUNDLE_IMG}/intra-1201ph.png`,
};

/** Maps catalog imageKey → display URL. Singles and bundles use local 480px PNGs in /public/bundles. */
export const bundleImageUrls: Record<string, string> = {
  "intra-1201ph": INTRA_BOTTLE_IMG,
  "intra-1201": `${BUNDLE_IMG}/intra-1201.jpg`,
  "intra-1231":
    "https://m.media-amazon.com/images/I/81Kn+FXl6BL._AC_UL450_SY450_QL70_.jpg",
  "intra-1232":
    "https://cdn.myshoptet.com/usr/shop.intra-lifestyles.net/user/shop/big/19-1_intra-trio-sirup-0-kapsle-3.jpg?ff=1&x=1024&y=768&q=85&ts=5bbcea27&sg=161563f2",
  "intra-1234":
    "https://cdn.myshoptet.com/usr/shop.intra-lifestyles.net/user/shop/big/19-2_intra-trio-sirup-1-kapsle-2.jpg?ff=1&x=1024&y=768&q=85&ts=5bbcea28&sg=161563f2",
  "nutria-1502ph": `${BUNDLE_IMG}/nutria-1502ph.png`,
  "nutria-1502": `${BUNDLE_IMG}/nutria-1502.png`,
  "cardio-1540ph": CARDIOLIFE_BOTTLE_IMG,
  "cardio-1540":
    "https://i.ibb.co/whykw9qW/530f1f05-8ea2-4f8f-b53b-f8c34193ff8c.png",
  "fibre-1038ph": `${BUNDLE_IMG}/fibre-1038ph.png`,
  "fibre-1038":
    "https://i.ibb.co/fYMrtvd5/6c3350ee-0de7-429e-8c0a-26940969488a.png",
  "test-checkout-10ph": `${BUNDLE_IMG}/intra-1201ph.png`,
  "btp-6999": `${BUNDLE_IMG}/btp-6999.jpg`,
  "btp-6999c":
    "https://images-na.ssl-images-amazon.com/images/I/71DZQKVGk+L.jpg",
};

export function pbcPhotoUrl(code: string) {
  return `${PBC_PHOTO}/${code}.jpg`;
}
