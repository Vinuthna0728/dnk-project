"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  ArrowRight,
  Truck,
  ShieldCheck,
  UserCheck,
  MapPin,
  Sparkles,
  Check,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useCartStore } from "@/store/useCartStore";
import { useLanguageStore } from "@/store/useLanguageStore";

interface DetailedProduct {
  id: string;
  category: string;
  cluster: string;
  state: string;
  artisanName: string;
  artisanExperience: string;
  image: string;
  price: number;
  hsCode: string;
  weight: string;
  dimensions: string;
  material: string;
  titles: Record<string, string>;
  descriptions: Record<string, string>;
}

const PRODUCT_DATABASE: Record<string, DetailedProduct> = {
  "prod-001": {
    id: "prod-001",
    category: "Textiles",
    cluster: "Madhubani",
    state: "Bihar, India",
    artisanName: "Sitadevi Devi",
    artisanExperience: "Master Artisan (28+ years of craft preservation)",
    image: "/products/madhubani-scarf.png",
    price: 2450,
    hsCode: "5007.20.10",
    weight: "250 grams",
    dimensions: "200 cm × 60 cm",
    material: "100% Pure Organic Tussar Silk with Natural Plant Pigments",
    titles: {
      en: "Hand-Painted Madhubani Silk Scarf",
      hi: "हस्तनिर्मित मधुबनी सिल्क दुपट्टा",
      kn: "ಕೈಯಿಂದ ರಚಿಸಲಾದ ಮಧುಬನಿ ರೇಷ್ಮೆ ಶಾಲೆಯ",
      te: "చేతితో వేసిన మధుబని పట్టు దుపట్టా",
      ml: "മധുബാനി പട്ട് ദുപ്പട്ട",
      mr: "मधुबनी हाताने रंगवलेला सिल्क स्कार्फ",
      bn: "হাতে আঁকা মধুবনী সিল্ক ওড়না",
      ta: "கைவண்ண மதுபானி பட்டு சால்வை",
    },
    descriptions: {
      en: "Individually hand-painted on pure Bhagalpuri Tussar silk using fine bamboo pens and natural organic dyes derived from turmeric, indigo, and marigold flowers. Each motif portrays traditional Mithila folk symbology symbolizing harmony and fertility. Every piece is unique and handcrafted directly by cluster artisans in Bihar.",
      hi: "शुद्ध भागलपुरी तसर सिल्क पर बांस की कलम और प्राकृतिक रंगों (हल्दी, नील व गेंदा फूल) से उकेरा गया प्रामाणिक मधुबनी शिल्प। प्रत्येक रूपांकन मिथिला की समृद्ध सांस्कृतिक विरासत को दर्शाता है।",
      te: "స్వచ్ఛమైన తస్సార్ పట్టుపై వెదురు కలం మరియు సహజ రంగులను ఉపయోగించి చేతితో వేసిన సాంప్రదాయ మధుబని పెయింటింగ్.",
      kn: "ಶುದ್ಧ ಟಸ್ಸಾರ್ ರೇಷ್ಮೆಯ ಮೇಲೆ ನೈಸರ್ಗಿಕ ಬಣ್ಣಗಳನ್ನು ಬಳಸಿ ಕೈಯಿಂದ ರಚಿಸಲಾದ ಸಾಂಪ್ರದಾಯಿಕ ಮಧುಬನಿ ಕಲೆ.",
      ml: "സ്വാഭാവിക നിറങ്ങൾ ഉപയോഗിച്ച് തസ്സർ പട്ടിൽ കൈകൊണ്ട് വരച്ച പരമ്പരാഗത മധുബാനി വസ്ത്രം.",
      mr: "नैसर्गिक रंगांचा वापर करून शुद्ध तसर सिल्कवर हाताने साकारलेली पारंपरिक मधुबनी कलाकृती.",
      bn: "বিশুদ্ধ তসর সিল্কের উপর প্রাকৃতিক রঙে হাতে আঁকা ঐতিহ্যবাহী মধুবনী চিত্রকর্ম।",
      ta: "இயற்கை வண்ணங்களைக் கொண்டு தூய டஸ்ஸர் பட்டில் கைவண்ணத்தால் உருவாக்கப்பட்ட மதுபானி சால்வை.",
    },
  },
  "prod-002": {
    id: "prod-002",
    category: "Pottery",
    cluster: "Bankura",
    state: "West Bengal, India",
    artisanName: "Tarapada Kumbhakar",
    artisanExperience: "4th Generation Wheel Potter & Terracotta Sculptor",
    image: "/products/terracotta-pitcher.png",
    price: 890,
    hsCode: "6912.00.10",
    weight: "1.2 kg",
    dimensions: "26 cm Height × 18 cm Diameter",
    material: "Riverbank Alluvial Clay with Terracotta Firing",
    titles: {
      en: "Terracotta Hand-Carved Water Pitcher",
      hi: "मिट्टी का नक्काशीदार पानी का घड़ा",
      kn: "ಟೆರಾಕೋಟಾ ಕೈಯಿಂದ ಕೆತ್ತಿದ ನೀರಿನ ಹೂಜಿ",
      te: "మట్టితో చేసిన చేతితో చెక్కిన నీటి కుండ",
      ml: "ടെറാക്കോട്ട കൊത്തുപണി ചെയ്ത ജലപാത്രം",
      mr: "टेराकोटा हाताने कोरलेली पाण्याची घागर",
      bn: "টেরাকোটা হাতে খোদাই করা জলের পাত্র",
      ta: "சுடுமண் செதுக்கப்பட்ட தண்ணீர் குவளை",
    },
    descriptions: {
      en: "Sculpted on a traditional manual potter's wheel using mineral-rich silt from the Damodar riverbed. Naturally cools drinking water without electricity while preserving essential minerals. Finished with traditional geometric carvings and wood-kiln pit firing in Bankura, West Bengal.",
      hi: "दामोदर नदी की उपजाऊ मिट्टी से पारंपरिक चाक पर गढ़ा गया प्राकृतिक जलपात्र। यह बिना बिजली के पानी को प्राकृतिक रूप से ठंडा और सुपाच्य रखता है।",
      te: "దామోదర్ నది సహజ మట్టితో సాంప్రదాయ చక్రంపై తయారు చేయబడిన ఆరోగ్యకరమైన నీటి కుండ.",
      kn: "ನೈಸರ್ಗಿಕ ನದಿ ಜೇಡಿಮಣ್ಣಿನಿಂದ ಕೈಚಕ್ರದ ಮೇಲೆ ನಿರ್ಮಿಸಲಾದ ಸಾಂಪ್ರದಾಯಿಕ ನೀರಿನ ಹೂಜಿ.",
      ml: "മൺപാത്ര നിർമ്മാണത്തിന്റെ തനിമയോടെ പ്രകൃതിദത്ത കളിമണ്ണിൽ തീർത്ത ജലപാത്രം.",
      mr: "नदीच्या नैसर्गिक मातीपासून चाकावर घडवलेली पारंपारिक आणि आरोग्यदायी पाण्याची घागर.",
      bn: "দামোদর নদের প্রাকৃতিক পলিমাটি দিয়ে চাকার উপর হাতে তৈরি ঐতিহ্যবাহী টেরাকোটা কলসি।",
      ta: "இயற்கை ஆற்று களிமண்ணில் பாரம்பரிய கைச்சக்கரத்தில் உருவாக்கப்பட்ட இயற்கை தண்ணீர் குவளை.",
    },
  },
  "prod-003": {
    id: "prod-003",
    category: "Metalcraft",
    cluster: "Bidar",
    state: "Karnataka, India",
    artisanName: "Shah Rasheed Ahmed Quadri",
    artisanExperience: "National Awardee & GI Tag Custodian (34+ years)",
    image: "/products/bidriware-vessel.png",
    price: 3200,
    hsCode: "7419.80.00",
    weight: "450 grams",
    dimensions: "16 cm Height × 12 cm Width",
    material: "Zinc-Copper Alloy with 99.9% Pure Silver Sheet Inlay",
    titles: {
      en: "Bidriware Silver Inlaid Floral Vessel",
      hi: "बिदरी हस्तशिल्प चांदी की नक्काशी पात्र",
      kn: "ಬಿದ್ರಿವೇರ್ ಬೆಳ್ಳಿ ಕೆತ್ತನೆಯ ಹೂವಿನ ಪಾತ್ರೆ",
      te: "బిద్రీవేర్ వెండి పొదిగిన పూల పాత్ర",
      ml: "ബിദ്രി സിൽവർ കൊത്തുപണി ചെയ്ത പൂപ്പാത്രം",
      mr: "बिद्रीवेअर चांदीचे नक्षीदार भांडे",
      bn: "বিদ্রিওয়্যার রৌপ্য খচিত ফুলের পাত্র",
      ta: "பித்ரிவேர் வெள்ளி வேலைப்பாடு கொண்ட மலர் பாத்திரம்",
    },
    descriptions: {
      en: "A 500-year-old metal inlay craft originally developed in the Bahmani Sultanate of Bidar. Cast from a specialized zinc-copper matrix, engraved with delicate floral arabesques, inlaid with pure silver wire, and patinated into permanent matte black using historical soil from the Bidar Fort grounds.",
      hi: "बीदर का 500 वर्ष पुराना ऐतिहासिक धातु शिल्प। जस्ता-तांबा मिश्र धातु पर 99.9% शुद्ध चांदी की तार से नक्काशी और बीदर किले की विशिष्ट मिट्टी से किया गया गहरा काला रंग।",
      te: "బీదర్ కోట చారిత్రక మట్టి మరియు స్వచ్ఛమైన వెండి నగిషీలతో తయారు చేయబడిన 500 సంవత్సరాల పురాతన బిద్రీ కళ.",
      kn: "ಬೀದರ್ ಕೋಟೆಯ ಮಣ್ಣು ಮತ್ತು ಶುದ್ಧ ಬೆಳ್ಳಿಯ ತಂತಿಯ ಕೆತ್ತನೆಯೊಂದಿಗೆ ಸಿದ್ಧಪಡಿಸಲಾದ ಐತಿಹಾಸಿಕ ಬಿದ್ರಿ ಕಲೆ.",
      ml: "ശുദ്ധമായ വെള്ളി കൊത്തുപണികൾ ചെയ്ത ചരിത്രപ്രസിദ്ധമായ ബിദ്രി ലോഹ നിർമ്മിതി.",
      mr: "बिदर किल्ल्यातील माती आणि शुद्ध चांदीची नक्षी वापरून तयार केलेली ५०० वर्षे जुनी ऐतिहासिक धातू कला.",
      bn: "খাঁটি রূপোর নকশা এবং ঐতিহাসিক বিদ্রি মাটির প্রলেপে নির্মিত ৫০০ বছরের ঐতিহ্যবাহী ধাতব শিল্প।",
      ta: "தூய வெள்ளி கம்பிகளால் செதுக்கப்பட்டு பீதர் கோட்டை மண்ணால் மெருகூட்டப்பட்ட வரலாற்று சிறப்புமிக்க பித்ரி கலை.",
    },
  },
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = (params.id as string) || "prod-001";

  const { currentLang } = useLanguageStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const setDirectBuy = useCartStore((state) => state.setDirectBuy);
  const [addedToast, setAddedToast] = useState(false);

  const product = PRODUCT_DATABASE[productId] || PRODUCT_DATABASE["prod-001"];
  const title = product.titles[currentLang] || product.titles.en;
  const description = product.descriptions[currentLang] || product.descriptions.en;

  // DIRECT BUY: Direct checkout routing without modifying shopping bag items
  const handleBuyDirectly = () => {
    setDirectBuy("d2c", {
      id: product.id,
      title_en: product.titles.en,
      title_hi: product.titles.hi || product.titles.en,
      description_en: product.descriptions.en,
      description_hi: product.descriptions.hi || product.descriptions.en,
      category: product.category,
      hs_code: product.hsCode,
      enhanced_image_url: product.image,
      raw_image_url: product.image,
      pricing: { retail_price_inr: product.price },
      logistics: { weight_grams: 500, is_fragile: false },
      artisan: { id: "a1", cluster_name: product.cluster, state: product.state },
    });
    router.push("/checkout?type=direct");
  };

  // ADD TO BAG: Increments bag counter, displays toast, stays on page
  const handleAddBag = () => {
    addToCart("d2c", {
      id: product.id,
      title_en: product.titles.en,
      title_hi: product.titles.hi || product.titles.en,
      description_en: product.descriptions.en,
      description_hi: product.descriptions.hi || product.descriptions.en,
      category: product.category,
      hs_code: product.hsCode,
      enhanced_image_url: product.image,
      raw_image_url: product.image,
      pricing: { retail_price_inr: product.price },
      logistics: { weight_grams: 500, is_fragile: false },
      artisan: { id: "a1", cluster_name: product.cluster, state: product.state },
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex font-poppins select-none">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="flex-1 p-6 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5A3A22] hover:text-[#183D2E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Crafts Catalog
          </Link>

          <div className="bg-[#F4EDE2] rounded-3xl border border-[#DEBFA3] p-6 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Image Showcase */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#EAE0D0] border border-[#DEBFA3] shadow-inner">
                <Image
                  src={product.image}
                  alt={title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <span className="absolute top-4 left-4 bg-[#FAF6F0]/95 backdrop-blur text-[#183D2E] text-xs font-bold px-3 py-1 rounded-full border border-[#DEBFA3] flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[#183D2E]" />
                  Verified GI Artisan Craft
                </span>
              </div>

              <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#DEBFA3] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#5A3A22]">
                  <Truck className="w-4 h-4 text-[#183D2E]" />
                  <span>Speed Post Delivery (3-5 Days)</span>
                </div>
                <span className="text-[#183D2E] font-bold">Pan-India Free</span>
              </div>
            </div>

            {/* Right Details Column */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-bold tracking-widest text-[#8C6D53] uppercase bg-[#FAF6F0] px-3 py-1 rounded-lg border border-[#DEBFA3] inline-block mb-2.5">
                  {product.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#2E1D11] leading-tight">
                  {title}
                </h1>
                <p className="text-xs text-[#8C6D53] mt-1 font-mono">HS Code: {product.hsCode}</p>
              </div>

              {/* Artisan Provenance Card */}
              <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#DEBFA3] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#183D2E]">
                  <UserCheck className="w-4 h-4 text-[#183D2E]" />
                  <span>Master Artisan: {product.artisanName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6B4E3D]">
                  <MapPin className="w-4 h-4 text-[#8C6D53] flex-shrink-0" />
                  <span>
                    Origin Cluster: <strong className="text-[#2E1D11]">{product.cluster}</strong>, {product.state}
                  </span>
                </div>
                <p className="text-[11px] text-[#8C6D53] italic pl-6">{product.artisanExperience}</p>
              </div>

              {/* Storytelling & Craft Technique */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A2E18] mb-1.5">
                  Craft Story & Technique
                </h3>
                <p className="text-xs text-[#5A3A22] leading-relaxed font-normal">{description}</p>
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#FAF6F0] p-3 rounded-xl border border-[#DEBFA3]">
                  <span className="text-[10px] font-bold text-[#8C6D53] block">Material</span>
                  <span className="font-semibold text-[#2E1D11]">{product.material}</span>
                </div>
                <div className="bg-[#FAF6F0] p-3 rounded-xl border border-[#DEBFA3]">
                  <span className="text-[10px] font-bold text-[#8C6D53] block">Net Weight & Dimensions</span>
                  <span className="font-semibold text-[#2E1D11]">
                    {product.weight} • {product.dimensions}
                  </span>
                </div>
              </div>

              {/* Price & Direct Actions */}
              <div className="pt-4 border-t border-[#DEBFA3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-medium text-[#8C6D53] block">
                    Direct Artisan Price (Dak Ghar Settled)
                  </span>
                  <span className="text-2xl font-black text-[#2E1D11]">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleAddBag}
                    className="p-3 rounded-2xl bg-[#FAF6F0] hover:bg-[#EAE0D0] border border-[#DEBFA3] text-[#183D2E] shadow-sm transition-all relative"
                    title="Add to Shopping Bag"
                  >
                    {addedToast ? <Check className="w-5 h-5 text-emerald-600" /> : <ShoppingBag className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={handleBuyDirectly}
                    className="py-3 px-6 rounded-2xl bg-[#183D2E] hover:bg-[#112D22] text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all group"
                  >
                    <span>Buy Directly</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Payout Guarantee Footer */}
          <div className="bg-[#F4EDE2] p-5 rounded-2xl border border-[#DEBFA3] flex items-center gap-3 text-xs text-[#5A3A22]">
            <ShieldCheck className="w-5 h-5 text-[#183D2E] flex-shrink-0" />
            <span>
              100% of your payment is remitted directly to the artisan's verified post office savings account under
              the Ministry of Social Justice & Empowerment commerce program.
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}