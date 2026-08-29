export type ProductVariant = {
  id: string;
  code: string;
  label: string;
  points: number;
  price: number;
  size: string;
  /** Resolved to a bundled product photo in catalog-data.ts */
  imageKey?: string;
};

export type ProductFaq = { q: string; a: string };

export type ProductResource = {
  label: string;
  href: string;
  kind?: "pdf" | "video" | "link";
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
  resources?: ProductResource[];
  faqs?: ProductFaq[];
};

export const catalogProducts: Product[] = [
  {
    slug: "intra",
    cateId: 1,
    name: "Intra",
    tagline: "The original 23-herb botanical drink",
    image: "https://www.lifestyles.net/includes/imgs/bottle_INTRA.png",
    variants: [
      {
        id: "intra-1201ph",
        code: "1201PH",
        label: "1 bottle",
        points: 35,
        price: 1807,
        size: "950 ml bottle",
        imageKey: "intra-1201ph",
      },
      {
        id: "intra-1201",
        code: "1201",
        label: "9 bottles per case",
        points: 315,
        price: 14484,
        size: "9 × 950 ml bottles",
        imageKey: "intra-1201",
      },
      {
        id: "intra-1231",
        code: "1231",
        label: "Trio Liquid (3 bottles)",
        points: 105,
        price: 4821,
        size: "3 × 950 ml liquid bottles",
        imageKey: "intra-1231",
      },
      {
        id: "intra-1232",
        code: "1232",
        label: "Trio Capsules (3 bottles)",
        points: 105,
        price: 4821,
        size: "3 × 64 capsule bottles",
        imageKey: "intra-1232",
      },
      {
        id: "intra-1234",
        code: "1234",
        label: "Trio Mixed (2 cap / 1 liq)",
        points: 105,
        price: 4821,
        size: "2 capsule + 1 liquid bottle",
        imageKey: "intra-1234",
      },
    ],
    short:
      "A unique proprietary blend of 23 botanical extracts designed to support, balance and strengthen the body's eight biological systems.",
    description: [
      "Intra is a unique and proprietary blend of 23 botanical extracts designed to support, balance and strengthen the 8 biological systems of the body. It has been specially formulated to include powerful yet very safe levels of each botanical extract and has been enjoyed around the world for over 15 years.",
      "Intra is a natural food supplement that helps maintain vitality and optimal health. It works with the natural systems of the body — because each person is different, we experience different results. In general, Intra helps support and strengthen the areas of the body where we are weakest.",
      "There are over 85,000 research studies published in peer-reviewed journals supporting the benefits of each of the botanicals found in Intra. Intra was developed for daily, long-term use using purified botanical extracts in a balanced and safe formulation.",
    ],
    benefits: [
      "Supports, balances and strengthens the body's eight biological systems",
      "23 time-tested botanical extracts in a synergistic, proprietary blend",
      "Natural food supplement for vitality and optimal health",
      "Suitable for the whole family — enjoyed worldwide for over 15 years",
      "Formulated with safe, moderate levels of each botanical for daily long-term use",
      "Independent lab testing confirms no pesticide residues — meets USP and European Pharmacopeia limits",
    ],
    ingredients:
      "Proprietary blend of 23 botanical extracts. Extensive and stringent independent laboratory testing confirms the safety and purity of all components — including ABC Testing verification that Intra meets USP pesticide residue limits with no organochloride, organonitrogen or organophosphate pesticides detected.",
    directions:
      "Take 28 ml to 56 ml (1–2 fluid ounces) daily. Up to 168 ml (6 fluid ounces) may be consumed safely if your body needs additional support. If you are on medication or new to Intra, start with 5–10 ml (1–2 tsp) and work up gradually.",
    resources: [
      {
        label: "Frequently asked questions (PDF)",
        href: "https://pbc.lifestyles.net/includes/shop/cate_pdf/Intra_ph.pdf",
        kind: "pdf",
      },
      {
        label: "Pesticide-free lab report (PDF)",
        href: "https://www.lifestyles.net/includes/files/Intra_Pesticide_free.pdf",
        kind: "pdf",
      },
      {
        label: "Product training videos (YouTube)",
        href: "https://www.youtube.com/playlist?list=PLiH5E2dwOpDoutaDuZa10DwYnlMBZ7C7i",
        kind: "video",
      },
    ],
    faqs: [
      {
        q: "What is Intra?",
        a: "Intra is a unique and proprietary blend of 23 botanical extracts designed to support, balance and strengthen the 8 biological systems of the body. It has been specially formulated to include powerful yet very safe levels of each botanical extract and has been enjoyed around the world for over 15 years. Intra is a natural food supplement that helps maintain vitality and optimal health.",
      },
      {
        q: "What type of benefits can I expect?",
        a: "Intra works with the natural systems of the body and, because each one of us is different, we experience different results. In general, Intra helps support and strengthen the areas of the body where we are weakest — often the results are very dramatic. There are over 85,000 research studies published in peer-reviewed journals supporting the benefits of each of the botanicals found in Intra.",
      },
      {
        q: "How much Intra should I take every day?",
        a: "The recommended dose is 28 ml to 56 ml (1–2 fluid ounces) a day, but up to 168 ml (6 fluid ounces) can be safely consumed daily if you feel like your body needs additional support. Intra is suitable for the whole family.",
      },
      {
        q: "Is it OK to take Intra every day for a long period of time?",
        a: "Yes. Intra was developed for this exact purpose using purified botanical extracts in a balanced and safe formulation. Many herbal experts recommend that high dosages of single botanicals be taken for only short periods of time — that does not apply with Intra, since it uses a moderate level of each botanical extract.",
      },
      {
        q: "Is Intra approved by the FDA?",
        a: "As a dietary supplement, Intra is considered a food and does not require FDA approval. The FDA does not offer opinions on or approval of dietary supplements. Extensive and stringent independent laboratory testing confirms the safety and purity of all components of Intra.",
      },
      {
        q: "Are there any side effects with Intra?",
        a: "In general, Intra has no side effects. Occasionally, a small minority of people go through a mild adjustment or cleansing period lasting no more than 3–5 days — start with 5–10 ml and work up slowly to avoid this. If you are allergic to any ingredient, as with any food product, do not continue to take Intra.",
      },
    ],
  },
  {
    slug: "nutria-plus",
    cateId: 12,
    name: "Nutria Plus",
    tagline: "Mixed extracts, vitamins and minerals",
    image: "https://www.lifestyles.net/includes/imgs/bottle_NP.png",
    variants: [
      {
        id: "nutria-plus-1502ph",
        code: "1502PH",
        label: "1 bottle",
        points: 30,
        price: 1339,
        size: "60 capsules",
        imageKey: "nutria-1502ph",
      },
      {
        id: "nutria-plus-1502",
        code: "1502",
        label: "4 bottles",
        points: 120,
        price: 5357,
        size: "4 × 60 capsules",
        imageKey: "nutria-1502",
      },
    ],
    short:
      "A highly concentrated antioxidant supplement with twelve synergistic natural ingredients, including SelenoExcell® organically bound selenium.",
    description: [
      "NutriaPlus is a highly concentrated antioxidant supplement containing a unique combination of twelve synergistic natural ingredients. Each serving provides antioxidants and phytonutrients from plant extracts, vitamins and minerals, including organically bound selenium called SelenoExcell® — the brand of selenium studied in the Nutritional Prevention of Cancer Study by the University of Arizona.",
      "Antioxidants help protect every cell and membrane in the body from the damaging effects of daily life and help prevent health conditions that result from accumulated oxidative damage. Using the zebrafish research model, Lifestyles set out to find the most powerful combination of natural ingredients to help prevent abnormal cell growth, enhance tissue repair, reduce inflammation, and protect cells from pollution and sun exposure.",
      "NutriaPlus is not intended to replace fresh fruits and vegetables but helps supplement important nutrients many people miss. Taking NutriaPlus together with Intra is encouraged — the combination increases ORAC value, effectiveness and overall health benefits through synergistic interactions.",
    ],
    benefits: [
      "Twelve synergistic natural ingredients with antioxidants, vitamins and minerals",
      "Includes SelenoExcell® — clinically studied organically bound selenium",
      "Helps protect cells and slow effects of aging when antioxidant intake is low",
      "Developed using zebrafish research — genetic structure closely mirrors humans",
      "Complements Intra for increased antioxidant capacity and synergistic benefits",
    ],
    ingredients:
      "Twelve synergistic natural ingredients including plant extracts, vitamins, minerals and SelenoExcell® (organically bound selenium).",
    directions:
      "Take 1 capsule daily with a meal. Vitamins, minerals and phytonutrients are better absorbed when a small amount of fat is present.",
    resources: [
      {
        label: "Official product information (PDF)",
        href: "https://pbc.lifestyles.net/includes/shop/cate_pdf/NutriaPlus_ph.pdf",
        kind: "pdf",
      },
    ],
    faqs: [
      {
        q: "What is NutriaPlus?",
        a: "NutriaPlus is a highly concentrated antioxidant supplement containing a unique combination of twelve synergistic natural ingredients. Each serving provides antioxidants and phytonutrients from plant extracts, vitamins and minerals, including SelenoExcell® organically bound selenium.",
      },
      {
        q: "What are antioxidants?",
        a: "Antioxidants help protect every cell and membrane in our body from the damaging effects of daily life and help prevent health conditions that result from accumulated damage from oxidation. Increasing antioxidant intake can result in a major improvement in health and increased longevity.",
      },
      {
        q: "How was NutriaPlus developed?",
        a: "Using the zebrafish research model, Lifestyles found the most powerful combination of natural ingredients to help humans prevent abnormal cell growth, enhance tissue repair, reduce inflammation, and protect cells from environmental pollution and sun exposure.",
      },
      {
        q: "Why are zebrafish used for research?",
        a: "Zebrafish share 70% of genes with humans and more than 80% of genes associated with human diseases. Results observed in zebrafish are reliably reflected in humans — a trusted method for determining what will benefit human health.",
      },
      {
        q: "Why should I take NutriaPlus?",
        a: "Consider NutriaPlus if you don't get 5–7 daily servings of fruits and vegetables, don't eat a balanced diet, skip meals, often eat fast food, have stress in your life, or live in a polluted environment.",
      },
      {
        q: "Do I still need to eat fresh fruits and vegetables?",
        a: "Absolutely. NutriaPlus supplements important nutrients but does not replace fresh produce, which also provides dietary fibre and water. Modern farming has also reduced the nutritional density of many fruits and vegetables.",
      },
      {
        q: "Can I take Intra and NutriaPlus together?",
        a: "Yes — this is encouraged. NutriaPlus was tested and developed to complement Intra. Together they provide increased ORAC value, greater effectiveness and more health benefits through synergistic interactions.",
      },
    ],
  },
  {
    slug: "cardiolife",
    cateId: 14,
    name: "CardioLife",
    tagline: "Heart and circulation support with K2",
    image: "https://www.lifestyles.net/includes/imgs/bottle_CL.png",
    variants: [
      {
        id: "cardiolife-1540ph",
        code: "1540PH",
        label: "1 bottle",
        points: 35,
        price: 1607,
        size: "60 capsules",
        imageKey: "cardio-1540ph",
      },
      {
        id: "cardiolife-1540",
        code: "1540",
        label: "4 bottles",
        points: 140,
        price: 6429,
        size: "4 × 60 capsules",
        imageKey: "cardio-1540",
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
    image: "https://www.lifestyles.net/includes/imgs/bottle_FL.png",
    variants: [
      {
        id: "fibrelife-1038ph",
        code: "1038PH",
        label: "1 bottle",
        points: 30,
        price: 1339,
        size: "60 capsules",
        imageKey: "fibre-1038ph",
      },
      {
        id: "fibrelife-1038",
        code: "1038",
        label: "4 bottles",
        points: 120,
        price: 5357,
        size: "4 × 60 capsules",
        imageKey: "fibre-1038",
      },
    ],
    short:
      "A revolutionary proprietary soluble fibre blend with konjac glucomannan to support healthy weight, blood sugar and cholesterol.",
    description: [
      "FibreLife is a revolutionary proprietary soluble fibre blend from Lifestyles designed to combat the worldwide trend toward low fibre intake and obesity. Formulated with konjac glucomannan, guar gum, xanthan gum and cinnamon extract, each batch is fully tested and standardized for quality, potency and viscosity.",
      "Once ingested with plenty of water, FibreLife forms a gel-like complex with the greatest viscosity of any dietary fibre. This slows digestion, reduces absorption of sugar and calories, lowers the Glycemic Index of a meal, and creates a sense of fullness without impacting energy levels.",
      "Health authorities recommend at least 30 g of total fibre daily, yet most people consume less than half that amount. FibreLife helps address this dietary gap and supports weight management, blood sugar regulation and healthy cholesterol levels.",
    ],
    benefits: [
      "Helps maintain healthy body weight by promoting fullness and minimizing overeating",
      "Lowers the Glycemic Index of meals and stabilizes energy levels",
      "Supports healthy cholesterol and elimination of toxins via digestive health",
      "Konjac glucomannan — clinically studied for blood sugar, appetite and cholesterol",
      "Highest viscosity soluble fibre blend — small doses, greater beneficial effects",
    ],
    ingredients:
      "Proprietary soluble fibre blend: Konjac Glucomannan (from Amorphophallus konjac root), Guar Gum, Xanthan Gum and Cinnamon extract. 500 mg soluble fibre per capsule. No artificial preservatives, sweeteners, starches or wheat.",
    directions:
      "Take 1–2 capsules before each meal, up to 3 times daily, with 250–500 mL of water per capsule. Drink at least 3 L of water or fluids per day. Start with 1 capsule daily and increase gradually every few days. Recommended for ages 13 and up.",
    resources: [
      {
        label: "Official product information (PDF)",
        href: "https://pbc.lifestyles.net/includes/shop/cate_pdf/FibreLife_ph.pdf",
        kind: "pdf",
      },
    ],
    faqs: [
      {
        q: "What is FibreLife?",
        a: "FibreLife is a proprietary, highly viscous soluble fibre blend from Lifestyles that supplements the body's dietary deficiency of fibre.",
      },
      {
        q: "How does FibreLife work?",
        a: "Once ingested with plenty of water, FibreLife forms a gel-like complex of natural fibres with the greatest viscosity of any dietary fibre. This slows digestion, reduces sugar and calorie absorption, and creates a sense of fullness without impacting energy levels.",
      },
      {
        q: "What is the Glycemic Index and why does it matter?",
        a: "The Glycemic Index (GI) measures how foods affect blood sugar. High-GI foods cause sharp spikes; low-GI foods are slowly digested for gradual, sustained energy. FibreLife helps lower the overall GI of a meal.",
      },
      {
        q: "If I don't need to lose weight, do I still need FibreLife?",
        a: "Yes. FibreLife addresses the dietary fibre gap — adults should consume at least 30 g daily, but most people get less than half through diet alone.",
      },
      {
        q: "Why is drinking water so important?",
        a: "FibreLife absorbs many times its weight in water. Without enough water it can cause constipation; with plenty of water it forms a smooth gel that eases constipation and promotes bowel regularity.",
      },
      {
        q: "Can children take FibreLife?",
        a: "Fibre is essential for children's health, but due to its high potency and gelling capacity, FibreLife is recommended only for ages 13 and older.",
      },
      {
        q: "How does FibreLife interact with medications?",
        a: "If you take medications or other supplements, take them at least one hour before FibreLife so both can work effectively.",
      },
    ],
  },
  {
    slug: "better-together-pack",
    cateId: 6,
    name: "Better Together Pack",
    tagline: "Complete wellness bundle — save when you buy together",
    image: "https://pbc.lifestyles.net/includes/shop/PH/photo/6999.jpg",
    variants: [
      {
        id: "btp-6999",
        code: "6999",
        label: "Liquid pack",
        points: 165,
        price: 7500,
        size: "2 Intra Liquid + NutriaPlus + CardioLife + FibreLife",
        imageKey: "btp-6999",
      },
      {
        id: "btp-6999c",
        code: "6999C",
        label: "Capsules pack",
        points: 165,
        price: 7500,
        size: "2 Intra Capsules + NutriaPlus + CardioLife + FibreLife",
        imageKey: "btp-6999c",
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

