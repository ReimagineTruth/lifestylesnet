export type CustomerReview = {
  id: number;
  name: string;
  location: string;
  product: string;
  text: string;
  stars: 5;
  /** Minutes before page load — used for initial staggered timestamps */
  minutesAgo: number;
};

const FIRST_NAMES = [
  "Maria",
  "Juan",
  "Ana",
  "Jose",
  "Grace",
  "Mark",
  "Liza",
  "Paolo",
  "Cherry",
  "Rico",
  "Jenny",
  "Arnel",
  "Rose",
  "Dennis",
  "Cathy",
  "Miguel",
  "Beth",
  "Ronald",
  "Nina",
  "Carlo",
  "Joy",
  "Eric",
  "Maya",
  "Tony",
  "Gina",
  "Felix",
  "Amy",
  "Leo",
  "Rhea",
  "Vincent",
  "Cora",
  "Allan",
  "Fe",
  "Jerome",
  "Lyn",
  "Ramil",
  "Diane",
  "Boyet",
  "Mel",
  "Jun",
  "Tess",
  "Omar",
  "Yen",
  "Gil",
  "Precy",
  "Noli",
  "Vangie",
  "Edwin",
  "Aileen",
  "Dan",
];

const LAST_INITIALS = "ABCDEFGHJKLMNPRSTVWYZ".split("");

const CITIES = [
  "Quezon City",
  "Manila",
  "Makati",
  "Cebu City",
  "Davao City",
  "Iloilo City",
  "Baguio",
  "Cagayan de Oro",
  "Pasig",
  "Taguig",
  "Parañaque",
  "Las Piñas",
  "Antipolo",
  "Bacolod",
  "General Santos",
  "Zamboanga City",
  "Caloocan",
  "Mandaluyong",
  "San Juan",
  "Marikina",
  "Pampanga",
  "Laguna",
  "Batangas",
  "Cavite",
  "Bulacan",
  "Pangasinan",
  "Naga City",
  "Tacloban",
  "Butuan",
  "Iligan",
];

const PRODUCTS = [
  "Intra",
  "Nutria Plus",
  "CardioLife",
  "FibreLife",
  "Better Together Pack",
] as const;

const REVIEW_TEMPLATES: ((product: string) => string)[] = [
  (p) => `Sobrang happy sa ${p}! Ramdam ko agad ang ganda sa araw-araw na routine ko.`,
  (p) => `Legit na 5 stars ang ${p}. Mabilis ang delivery at maayos ang packaging.`,
  (p) => `Matagal ko nang ginagamit ang ${p} at tuloy-tuloy pa rin ang positive effect sa akin.`,
  (p) => `Highly recommended ang ${p}! Sulit na sulit ang presyo para sa quality.`,
  (p) => `Grabe, ang ganda ng ${p} — mas energetic ako at mas magaan ang pakiramdam.`,
  (p) => `Order ko ulit ang ${p}. Trusted na talaga ng buong pamilya namin.`,
  (p) => `Salamat Lifestyles PH! Ang ${p} ay naging part na ng daily habit namin.`,
  (p) => `Authentic at mabilis dumating ang ${p}. Five stars, no doubt!`,
  (p) => `Napaka-smooth ng checkout at ang ${p} talagang worth it.`,
  (p) => `Simula nung ${p}, mas balanced ang araw ko. Super satisfied customer here!`,
  (p) => `Maganda ang lasa at madaling inumin ang ${p}. Perfect sa busy schedule.`,
  (p) => `Ang ${p} ang pinaka-effective na supplement na natry ko. Panatilihin niyo quality!`,
  (p) => `From order hanggang delivery, excellent service. At ang ${p}? Top notch!`,
  (p) => `Buong barangay namin nagre-recommend ng ${p} — legit talaga.`,
  (p) => `Walang hassle, original product, at ang ${p} talagang tumutulong sa wellness goals ko.`,
  (p) => `Mas maganda ang tulog at mood ko simula nung ${p}. Maraming salamat!`,
  (p) => `Repeat customer ako dahil sa ${p}. Consistent ang quality every order.`,
  (p) => `Ang ganda ng customer support at ang ${p} mismo — 5 stars all the way.`,
  (p) => `Sobrang laking tulong ng ${p} sa daily routine ng asawa ko at akin.`,
  (p) => `Fast shipping sa probinsya at perfect condition ang ${p}. Highly satisfied!`,
];

function pick<T>(list: readonly T[], index: number): T {
  return list[index % list.length]!;
}

function generateCustomerReviewsTagalog(): CustomerReview[] {
  const reviews: CustomerReview[] = [];

  for (let i = 0; i < 500; i++) {
    const first = pick(FIRST_NAMES, i * 3 + 7);
    const lastInitial = pick(LAST_INITIALS, i * 5 + 2);
    const product = pick(PRODUCTS, i * 11 + 3);
    const template = pick(REVIEW_TEMPLATES, i * 13 + 1);

    reviews.push({
      id: i + 1,
      name: `${first} ${lastInitial}.`,
      location: pick(CITIES, i * 17 + 5),
      product,
      text: template(product),
      stars: 5,
      minutesAgo: 3 + ((i * 47) % 4320),
    });
  }

  return reviews;
}

export const customerReviewsTagalog = generateCustomerReviewsTagalog();

/** Unique reviews in the live rotation pool */
export const REVIEW_POOL_SIZE = customerReviewsTagalog.length;

/** Public-facing total review count shown on the site */
export const REVIEW_COUNT = 50_000;

export function reviewsForProduct(productName: string): CustomerReview[] {
  return customerReviewsTagalog.filter((r) => r.product === productName);
}

export function formatReviewTimeAgo(minutesAgo: number, liveOffsetMin = 0): string {
  const total = Math.max(1, minutesAgo + liveOffsetMin);
  if (total < 2) return "kanina lang";
  if (total < 60) return `${total} min ang nakalipas`;
  const hours = Math.floor(total / 60);
  if (hours < 24) return `${hours} oras ang nakalipas`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "kahapon";
  if (days < 7) return `${days} araw ang nakalipas`;
  const weeks = Math.floor(days / 7);
  return `${weeks} linggo ang nakalipas`;
}

export const REVIEW_AVERAGE = 5;

export function formatPublicReviewCount(count = REVIEW_COUNT): string {
  return `${count.toLocaleString("en-PH")}+`;
}
