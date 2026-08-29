export type FaqItem = { q: string; a: string };

export type FaqSection = {
  id: string;
  title: string;
  items: FaqItem[];
};

/** FAQ sa Tagalog — batay sa opisyal na impormasyon mula sa Lifestyles Global Network (lifestyles.net). */
export const lifestylesFaqTagalog: FaqSection[] = [
  {
    id: "lifestyles",
    title: "Tungkol sa Lifestyles",
    items: [
      {
        q: "Ano ang Lifestyles?",
        a: "Ang Lifestyles ay global na kumpanya ng wellness na pinagsasama ang siyensya at kalikasan upang mag-alok ng de-kalidad na dietary supplements. Mahigit tatlong dekada nang tumutulong ang Lifestyles sa mga tao na mapabuti at mapanatili ang kanilang pangkalahatang kalusugan.",
      },
      {
        q: "Ano ang layunin ng Lifestyles Philippines?",
        a: "Ang Lifestyles Philippines ay awtorisadong distributor ng Lifestyles Global Network sa bansa. Nagbebenta kami ng Intra, Nutria Plus, CardioLife, FibreLife at mga bundle — may delivery sa buong Pilipinas.",
      },
      {
        q: "May therapeutic claims ba ang mga produkto?",
        a: "Hindi. Ang mga produktong ibinebenta namin ay dietary supplements, hindi gamot. Hindi nila dinidisenyo upang mag-diagnose, magpagaling, o mag-prevent ng anumang sakit. Walang aprubadong therapeutic claims.",
      },
    ],
  },
  {
    id: "intra",
    title: "Intra",
    items: [
      {
        q: "Ano ang Intra?",
        a: "Ang Intra ay flagship product ng Lifestyles — isang masarap na inumin na may 23 pinagsamang botanical extracts mula sa halaman, ugat, balat ng puno, dahon, at bulaklak. Nagbibigay ito ng antioxidants, flavonoids, at iba pang sustansyang tumutulong sa katawan.",
      },
      {
        q: "Ano ang walong biological systems na sinusuportahan ng Intra?",
        a: "Tumutulong ang Intra na balansehin at palakasin ang walong sistema ng katawan: Immune, Nervous, Hormonal (Endocrine), Digestive and Energy, Reproductive, Structural (Musculoskeletal), Eliminative/Antioxidant, at Cardiovascular.",
      },
      {
        q: "Bakit mahalaga ang synergy ng 23 botanicals?",
        a: "Ang lihim ng bisa ng Intra ay ang pagtutulungan ng mga halamang sangkap — mas malaki ang benepisyo kaysa sa isang botanical lamang. Ang formula ay eksklusibo sa Lifestyles at pareho na simula 1992.",
      },
      {
        q: "Magkano ang inirerekomendang dose araw-araw?",
        a: "Karaniwang 28 ml hanggang 56 ml (1–2 fluid ounce) bawat araw. Maaaring hanggang 168 ml (6 fluid ounce) kung kailangan ng dagdag na suporta. Angkop para sa buong pamilya.",
      },
      {
        q: "Ligtas ba ang Intra para sa mga atleta?",
        a: "Oo. Sertipikado ng International Olympic Committee bilang Safe for Athletic Use — walang steroids o stimulants ang Intra.",
      },
      {
        q: "May side effects ba ang Intra?",
        a: "Kadalasan wala. Minsan, may ilang taong dumaan sa maikling adjustment o cleansing period (3–5 araw). Magsimula sa maliit na dose (5–10 ml) at unti-unting dagdagan. Kung allergic sa anumang sangkap, huwag ipagpatuloy ang paggamit.",
      },
    ],
  },
  {
    id: "nutria-plus",
    title: "Nutria Plus",
    items: [
      {
        q: "Ano ang Nutria Plus?",
        a: "Ang Nutria Plus ay makapangyarihang antioxidant supplement na may fruit at vegetable concentrates, plant extracts, vitamin C at selenium. Tumutulong itong ipagtanggol ang katawan laban sa hamon ng modernong pamumuhay.",
      },
      {
        q: "Ano ang zebrafish research model?",
        a: "Unang natural health product na ginawa gamit ang Zebrafish Research Model. Ang zebrafish ay may 70% na pareho ng genetic code sa tao at 85% ng mga gene na sanhi ng sakit sa tao — kaya maaasahan ang resulta para sa kalusugan ng tao.",
      },
      {
        q: "Ano ang mga napatunayang benepisyo ng Nutria Plus?",
        a: "Nababawasan ang cell damage mula sa polusyon at kemikal, sinusuportahan ang cell health, binabawasan ang inflammation sa cellular level, at tumutulong panatilihing malusog ang mga selula habang tumatanda.",
      },
      {
        q: "Puwede bang sabay ang Intra at Nutria Plus?",
        a: "Oo, at hinihikayat ito. Mas tumataas ang ORAC value at overall health benefits kapag pinagsama ang dalawa dahil sa synergistic interaction.",
      },
      {
        q: "Paano i-verify ang tunay na rehistradong Nutria Plus?",
        a: "Bumili lamang sa awtorisadong channel tulad ng opisyal na store na ito. Gamitin ang FDA Verification Portal o basahin ang aming pahina sa /fda para sa opisyal na advisory at gabay sa pag-verify.",
      },
    ],
  },
  {
    id: "cardiolife",
    title: "CardioLife",
    items: [
      {
        q: "Ano ang CardioLife?",
        a: "Ang CardioLife ay siyentipikong dietary supplement na may vitamins, minerals at plant extracts na sumusuporta sa cardiovascular health at daloy ng dugo sa buong katawan.",
      },
      {
        q: "Ano ang VitaMK7?",
        a: "Ang CardioLife ay may Vitamin K2 (MK7) na kilala bilang VitaMK7 — pinakamataas na kalidad at pinaka-aktibong anyo ng Vitamin K2. Pinapalakas nito ang daloy ng dugo at tinutulungan ilipat ang calcium sa buto kung saan ito nararapat.",
      },
      {
        q: "Para saan araw-araw ang CardioLife?",
        a: "Tumutulong panatilihin ang kalusugan ng arteries at blood vessels, i-optimize ang blood flow, at suportahan ang brain health at overall well-being sa pamamagitan ng malusog na sirkulasyon.",
      },
    ],
  },
  {
    id: "fibrelife",
    title: "FibreLife",
    items: [
      {
        q: "Ano ang FibreLife?",
        a: "Ang FibreLife ay proprietary soluble fibre blend ng Lifestyles — nagbibigay ng araw-araw na fibre, tumutulong kontrolin ang gana, at suportahan ang malusog na timbang ng katawan.",
      },
      {
        q: "Bakit kailangan ng sapat na fibre?",
        a: "Tinatawag na miracle nutrient ang fibre ng mga siyentipiko. Ang kakulangan nito ay nauugnay sa obesity, heart disease at diabetes. Karamihan ay kumukuha ng wala pang kalahating inirerekomenda (30 g araw-araw).",
      },
      {
        q: "Ano ang laman ng bawat capsule?",
        a: "500 mg soluble fibre mula sa Konjac Glucomannan, Guar Gum, Xanthan Gum at cinnamon extract. Kapag may sapat na tubig, bumubuo ito ng gel-like complex na bumabagal sa digestion at nagpaparamdam ng busog.",
      },
      {
        q: "Paano inumin ang FibreLife?",
        a: "Sundin ang direksyon sa label. Uminom ng sapat na tubig kapag kumukuha ng fibre supplement. Kung umiinom ng gamot o ibang supplement, magitan ng hindi bababa sa isang oras.",
      },
    ],
  },
  {
    id: "shop",
    title: "Pag-order at delivery",
    items: [
      {
        q: "Paano bumili sa Lifestyles Philippines online store?",
        a: "Pumili ng produkto, idagdag sa cart, at mag-checkout. Available ang COD, QR Ph, card, at PayPal. Libre ang shipping sa orders na ₱3,000 pataas sa buong Pilipinas.",
      },
      {
        q: "Gaano katagal ang delivery?",
        a: "Karaniwang 3–7 araw ng negosyo sa Metro Manila at 5–10 araw sa probinsya, depende sa courier at lokasyon. Makakatanggap ka ng order confirmation at tracking kapag available.",
      },
      {
        q: "Paano makipag-ugnayan sa support?",
        a: "Mag-email sa support@lifestyles.ph o gamitin ang feedback widget sa site (Mag-feedback). Tutugon kami sa lalong madaling panahon sa office hours (Lunes–Biyernes, 9 AM–6 PM PHT).",
      },
    ],
  },
  {
    id: "opportunity",
    title: "Licensee opportunity",
    items: [
      {
        q: "Ano ang Lifestyles business opportunity?",
        a: "Tinatanong ng Lifestyles: Ano ang mga pangarap mo para sa kinabukasan? Maaaring tulungan ka ng Lifestyles na maabot ang mga ito bilang Independent Licensee — ibenta ang mga produkto at bumuo ng sariling negosyo.",
      },
      {
        q: "Saan ako makakakuha ng higit pang impormasyon?",
        a: "Bisitahin ang aming Opportunity page sa site o ang opisyal na Lifestyles global website. Makipag-ugnayan din sa amin para sa personal na gabay sa pagiging Licensee sa Pilipinas.",
      },
    ],
  },
];

export const LIFESTYLES_OFFICIAL_URL = "https://www.lifestyles.net/ph-en/";
