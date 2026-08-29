export type ProductVariant = {
  id: string;
  code: string;
  label: string;
  points: number;
  price: number;
  size: string;
};

export type Product = {
  slug: string;
  cateId: number;
  name: string;
  tagline: string;
  image: string;
  variants: ProductVariant[];
  short: string;
  description: string[];
  benefits: string[];
  ingredients: string;
  directions: string;
};

export const catalogProducts: Product[] = [
  {
    slug: "intra",
    cateId: 1,
    name: "Intra",
    tagline: "The original 23-herb botanical drink",
    image: "/src/assets/bottle_INTRA.png",
    variants: [
      {
        id: "intra-1201ph",
        code: "1201PH",
        label: "1 bottle",
        points: 35,
        price: 1807,
        size: "950 ml bottle",
      },
      {
        id: "intra-1201",
        code: "1201",
        label: "9 bottles per case",
        points: 315,
        price: 14484,
        size: "9 × 950 ml bottles",
      },
      {
        id: "intra-1231",
        code: "1231",
        label: "Trio Liquid (3 bottles)",
        points: 105,
        price: 4821,
        size: "3 × 950 ml liquid bottles",
      },
      {
        id: "intra-1232",
        code: "1232",
        label: "Trio Capsules (3 bottles)",
        points: 105,
        price: 4821,
        size: "3 × 64 capsule bottles",
      },
      {
        id: "intra-1234",
        code: "1234",
        label: "Trio Mixed (2 cap / 1 liq)",
        points: 105,
        price: 4821,
        size: "2 capsule + 1 liquid bottle",
      },
    ],
    short:
      "A proprietary formulation of 23 time-tested botanical extracts that work together to balance and strengthen the body's eight biological systems.",
    description: [
      "For more than 3,000 years, civilizations in every corner of the world have documented the powerful effects that herbs, plants, roots, tree bark, leaves and flowers — the botanicals — have on human well-being. Intra combines this ancient knowledge with advanced science to create a nutritional supplement geared to today's lifestyles.",
      "Intra is a pleasant-tasting, proprietary formulation of 23 time-tested and trusted botanical extracts that provide the body with antioxidants, flavonoids, lignins, polysaccharides and other health-enhancing nutrients specific to each herbal extract.",
      "The key to Intra's effectiveness is the synergy of the blended botanicals working together — providing greater benefits than an individual botanical on its own. Intra's unique formula is exclusive to Lifestyles and has remained unchanged since 1992.",
      "Intra is certified Safe for Athletic Use by the International Olympic Committee because it does not contain steroids or stimulants. Its formula has been enjoyed by millions of satisfied customers worldwide.",
    ],
    benefits: [
      "Balances the body's eight biological systems: Immune, Nervous, Hormonal (Endocrine), Digestive & Energy, Reproductive, Structural (Musculoskeletal), Eliminative / Antioxidant, and Cardiovascular",
      "Provides antioxidants, flavonoids, lignins and polysaccharides from 23 botanical extracts",
      "Certified Safe for Athletic Use by the International Olympic Committee — no steroids or stimulants",
      "Formula unchanged since 1992, enjoyed by millions worldwide",
    ],
    ingredients:
      "Proprietary blend of 23 botanical extracts including Astragalus, Cascara Sagrada, Chamomile, Chicory, Dandelion, Echinacea, Ginger, Licorice, Passion Flower, Rose Hips, Sarsaparilla, Schisandra and Siberian Ginseng.",
    directions:
      "Drink 30 ml (one ounce) of Intra a day — it can make a world of difference. Drink Intra. Share Intra. Every Day.",
  },
  {
    slug: "nutria-plus",
    cateId: 12,
    name: "Nutria Plus",
    tagline: "Mixed extracts, vitamins and minerals",
    image: "/src/assets/nutriaplus.png",
    variants: [
      {
        id: "nutria-plus-1502ph",
        code: "1502PH",
        label: "1 bottle",
        points: 30,
        price: 1339,
        size: "60 capsules",
      },
      {
        id: "nutria-plus-1502",
        code: "1502",
        label: "4 bottles",
        points: 120,
        price: 5357,
        size: "4 × 60 capsules",
      },
    ],
    short:
      "A complete daily multivitamin with plant extracts, vitamins and minerals for everyday nutritional support.",
    description: [
      "Nutria Plus combines essential vitamins and minerals with mixed plant extracts in a single daily capsule.",
      "It is designed to fill the nutritional gaps of a busy Filipino lifestyle where fresh, varied meals are not always possible.",
    ],
    benefits: [
      "Complete daily vitamin and mineral support",
      "Antioxidant plant extracts",
      "Supports immune function",
      "Convenient once-a-day capsule",
    ],
    ingredients:
      "Vitamins A, C, D, E, B-complex, Zinc, Selenium, Magnesium, Calcium and a proprietary blend of mixed botanical extracts.",
    directions: "Take 1 capsule daily after a meal.",
  },
  {
    slug: "cardiolife",
    cateId: 14,
    name: "CardioLife",
    tagline: "Heart and circulation support with K2",
    image: "/src/assets/cardiolife.png",
    variants: [
      {
        id: "cardiolife-1540ph",
        code: "1540PH",
        label: "1 bottle",
        points: 35,
        price: 1807,
        size: "60 capsules",
      },
      {
        id: "cardiolife-1540",
        code: "1540",
        label: "4 bottles",
        points: 140,
        price: 6429,
        size: "4 × 60 capsules",
      },
    ],
    short:
      "A plant-based formulation with Vitamin K2 to support cardiovascular health and healthy circulation.",
    description: [
      "CardioLife brings together plant sterols, vitamins and Vitamin K2 in a formulation focused on the heart and circulatory system.",
      "Vitamin K2 helps direct calcium to the bones where it belongs, supporting both arterial and skeletal health.",
    ],
    benefits: [
      "Supports cardiovascular health",
      "Contains Vitamin K2 (MK-7)",
      "Helps maintain healthy circulation",
      "Complements an active lifestyle",
    ],
    ingredients:
      "Vitamin K2 (MK-7), Vitamin D3, Coenzyme Q10, Hawthorn extract, Garlic extract and plant sterols.",
    directions: "Take 1 capsule twice daily with meals.",
  },
  {
    slug: "fibrelife",
    cateId: 3,
    name: "FibreLife",
    tagline: "Daily dietary fibre for digestive balance",
    image: "/src/assets/fibrelife.png",
    variants: [
      {
        id: "fibrelife-1038ph",
        code: "1038PH",
        label: "1 bottle",
        points: 30,
        price: 1339,
        size: "60 capsules",
      },
      {
        id: "fibrelife-1038",
        code: "1038",
        label: "4 bottles",
        points: 120,
        price: 5357,
        size: "4 × 60 capsules",
      },
    ],
    short:
      "A soluble and insoluble fibre blend that supports regular digestion and comfortable gut health.",
    description: [
      "FibreLife delivers a balanced mix of soluble and insoluble dietary fibre to support digestive regularity.",
      "Most modern diets fall short of the recommended daily fibre intake — FibreLife makes closing that gap simple.",
    ],
    benefits: [
      "Supports digestive regularity",
      "Helps maintain a healthy gut environment",
      "Contributes to a feeling of fullness",
      "Gentle for daily use",
    ],
    ingredients: "Psyllium husk, oat bran, apple pectin, inulin and guar gum.",
    directions: "Take 2 capsules daily with a full glass of water.",
  },
  {
    slug: "better-together-pack",
    cateId: 6,
    name: "Better Together Pack",
    tagline: "Complete wellness bundle — save when you buy together",
    image: "/src/assets/bottle_INTRA.png",
    variants: [
      {
        id: "btp-8999",
        code: "8999",
        label: "Liquid pack",
        points: 165,
        price: 7500,
        size: "2 Intra Liquid + NutriaPlus + CardioLife + FibreLife",
      },
      {
        id: "btp-6999c",
        code: "6999C",
        label: "Capsules pack",
        points: 165,
        price: 7500,
        size: "2 Intra Capsules + NutriaPlus + CardioLife + FibreLife",
      },
    ],
    short:
      "Lifestyles products are designed to work in synergy. This bundle combines Intra with NutriaPlus, CardioLife and FibreLife for complete daily wellness support.",
    description: [
      "The Better Together Pack brings together four core Lifestyles formulations in one convenient bundle.",
      "Each product supports a different aspect of wellness — botanical balance, daily nutrition, cardiovascular health and digestive fibre — so they complement each other when used together.",
    ],
    benefits: [
      "Complete 4-product wellness routine in one order",
      "Bundle savings vs buying separately",
      "Liquid or capsules Intra options",
      "Ideal for families or long-term daily use",
    ],
    ingredients: "See individual product pages for Intra, Nutria Plus, CardioLife and FibreLife.",
    directions: "Follow the directions on each product label for daily use.",
  },
];

