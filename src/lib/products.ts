import intraImgAsset from "@/assets/bottle_INTRA.png.asset.json";
import nutriaImg from "@/assets/nutriaplus.jpg";
import cardioImg from "@/assets/cardiolife.jpg";
import fibreImg from "@/assets/fibrelife.jpg";

const intraImg = intraImgAsset.url;

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  size: string;
  image: string;
  short: string;
  description: string[];
  benefits: string[];
  ingredients: string;
  directions: string;
};

export const products: Product[] = [
  {
    slug: "intra",
    name: "Intra",
    tagline: "The original 23-herb botanical drink",
    price: 2350,
    size: "950 ml bottle",
    image: intraImg,
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
    name: "Nutria Plus",
    tagline: "Mixed extracts, vitamins and minerals",
    price: 1650,
    size: "60 capsules",
    image: nutriaImg,
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
    name: "CardioLife",
    tagline: "Heart and circulation support with K2",
    price: 1890,
    size: "60 capsules",
    image: cardioImg,
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
    name: "FibreLife",
    tagline: "Daily dietary fibre for digestive balance",
    price: 1450,
    size: "60 capsules",
    image: fibreImg,
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
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const peso = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
