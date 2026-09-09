"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  HeartHandshake,
  CheckCircle2,
  Check,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { useLanguageStore } from "@/store/useLanguageStore";

interface D2CProduct {
  id: string;
  category: "textiles" | "pottery" | "metalcraft" | "woodcraft";
  cluster: string;
  artisanName: string;
  image: string;
  price: number;
  titles: Record<string, string>;
}

const CATALOG: D2CProduct[] = [
  {
    id: "prod-001",
    category: "textiles",
    cluster: "Madhubani, Bihar",
    artisanName: "Sitadevi Devi",
    image: "/products/madhubani-scarf.png",
    price: 2450,
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
  },
  {
    id: "prod-002",
    category: "pottery",
    cluster: "Bankura, West Bengal",
    artisanName: "Tarapada Kumbhakar",
    image: "/products/terracotta-pitcher.png",
    price: 890,
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
  },
  {
    id: "prod-003",
    category: "metalcraft",
    cluster: "Bidar, Karnataka",
    artisanName: "Shah Rasheed Ahmed Quadri",
    image: "/products/bidriware-vessel.png",
    price: 3200,
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
  },
];

export default function D2CShopPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addToCart = useCartStore((state) => state.addToCart);
  const setDirectBuy = useCartStore((state) => state.setDirectBuy);
  const { currentLang, t } = useLanguageStore();
  const texts = t();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);

  const categories = [
    { key: "all", label: texts.all },
    { key: "textiles", label: texts.textiles },
    { key: "pottery", label: texts.pottery },
    { key: "metalcraft", label: texts.metalcraft },
    { key: "woodcraft", label: texts.woodcraft },
  ];

  const filtered = CATALOG.filter((item) => {
    const matchCat = activeCategory === "all" || item.category === activeCategory;
    const title = item.titles[currentLang] || item.titles.en;
    const matchSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cluster.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.artisanName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Only this button adds to bag
  const handleAddToBag = (product: D2CProduct) => {
    addToCart("d2c", {
      id: product.id,
      title_en: product.titles.en,
      title_hi: product.titles.hi || product.titles.en,
      description_en: "",
      description_hi: "",
      category: product.category,
      hs_code: "5007.20.10",
      enhanced_image_url: product.image,
      raw_image_url: product.image,
      pricing: { retail_price_inr: product.price },
      logistics: { weight_grams: 300, is_fragile: false },
      artisan: { id: "a1", cluster_name: product.cluster, state: "India" },
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  // Direct Buy: checks if user is authenticated at the point of purchase
  const handleDirectBuy = (product: D2CProduct) => {
    setDirectBuy("d2c", {
      id: product.id,
      title_en: product.titles.en,
      title_hi: product.titles.hi || product.titles.en,
      description_en: "",
      description_hi: "",
      category: product.category,
      hs_code: "5007.20.10",
      enhanced_image_url: product.image,
      raw_image_url: product.image,
      pricing: { retail_price_inr: product.price },
      logistics: { weight_grams: 300, is_fragile: false },
      artisan: { id: "a1", cluster_name: product.cluster, state: "India" },
    });

    if (!isAuthenticated) {
      router.push("/login?channel=d2c&redirect=/checkout?type=direct");
    } else {
      router.push("/checkout?type=direct");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex font-poppins select-none">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="flex-1 p-6 sm:p-8 max-w-6xl w-full mx-auto space-y-8">
          <div className="bg-[#F4EDE2] p-4 rounded-3xl border border-[#DEBFA3] shadow-sm flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#8C6D53]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={texts.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF6F0] rounded-2xl border border-[#DEBFA3] focus:border-[#183D2E] outline-none text-xs text-[#2E1D11] placeholder:text-[#9C8270]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {categories.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setActiveCategory(c.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeCategory === c.key
                      ? "bg-[#183D2E] text-white shadow-sm"
                      : "bg-[#FAF6F0] text-[#4A2E18] hover:bg-[#EAE0D0] border border-[#DEBFA3]"
                    }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => {
              const productTitle = product.titles[currentLang] || product.titles.en;
              const isJustAdded = addedId === product.id;

              return (
                <div
                  key={product.id}
                  className="bg-[#F4EDE2] rounded-3xl border border-[#DEBFA3] hover:border-[#183D2E] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <Link
                      href={`/product/${product.id}`}
                      className="block relative aspect-square w-full bg-[#EAE0D0] overflow-hidden cursor-pointer"
                    >
                      <Image
                        src={product.image}
                        alt={productTitle}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-[#FAF6F0]/95 backdrop-blur text-[#183D2E] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#DEBFA3] flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3 text-[#183D2E]" />
                        {texts.aiEnhanced}
                      </span>
                    </Link>

                    <div className="p-4 sm:p-5">
                      <span className="text-[11px] font-semibold text-[#8C6D53] block mb-1">
                        {product.cluster} • {product.artisanName}
                      </span>
                      <Link href={`/product/${product.id}`}>
                        <h3 className="text-base font-bold text-[#2E1D11] hover:text-[#183D2E] transition-colors line-clamp-1">
                          {productTitle}
                        </h3>
                      </Link>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 pt-0">
                    <div className="pt-3 border-t border-[#DEBFA3]/70 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-medium text-[#8C6D53] block">
                          {texts.fairPrice}
                        </span>
                        <span className="text-base font-black text-[#2E1D11]">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Add to Bag (updates bag counter) */}
                        <button
                          onClick={() => handleAddToBag(product)}
                          className="p-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#EAE0D0] border border-[#DEBFA3] text-[#183D2E] transition-colors cursor-pointer"
                          title="Add to Shopping Bag"
                        >
                          {isJustAdded ? (
                            <Check className="w-4 h-4 text-emerald-700" />
                          ) : (
                            <ShoppingBag className="w-4 h-4" />
                          )}
                        </button>

                        {/* Buy Button -> Directly checks out without touching the bag */}
                        <button
                          onClick={() => handleDirectBuy(product)}
                          className="py-2.5 px-3.5 rounded-xl bg-[#183D2E] hover:bg-[#112D22] text-white text-xs font-bold shadow-sm flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <span>{texts.buyNow}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <section className="bg-[#F4EDE2] rounded-3xl p-6 sm:p-8 border border-[#DEBFA3] shadow-sm space-y-5">
            <div className="border-b border-[#DEBFA3] pb-4">
              <span className="text-[10px] font-bold tracking-widest text-[#8C6D53] uppercase block">
                ETHICAL COMMERCE CHARTER
              </span>
              <h2 className="text-lg font-serif font-black text-[#2E1D11]">
                Shilp Setu Buyer Assurance & Fair-Trade Guidelines
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#5A3A22]">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[#183D2E]">
                  <HeartHandshake className="w-4 h-4" />
                  <span>100% Direct Payout</span>
                </div>
                <p className="text-[#6B4E3D] leading-relaxed">
                  Every rupee of the listed artisan price is directly settled into the artisan's Dak Ghar bank account without intermediary cuts.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[#183D2E]">
                  <Truck className="w-4 h-4" />
                  <span>India Post Safeguarded</span>
                </div>
                <p className="text-[#6B4E3D] leading-relaxed">
                  Packaged by certified cluster artisans and dispatched via India Post Speed Post with tamper-evident packaging and live barcode tracking.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[#183D2E]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticity Guaranteed</span>
                </div>
                <p className="text-[#6B4E3D] leading-relaxed">
                  All handicrafts undergo digital GI-tag and cluster verification under the Ministry of Social Justice & Empowerment scheme.
                </p>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-[#8C6D53] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#183D2E] flex-shrink-0" />
              <span>Compliant with Open Network for Digital Commerce (ONDC) and Department of Posts regulations.</span>
            </div>
          </section>
        </main>

        <footer className="w-full bg-[#183D2E] text-[#FAF6F0] py-4 px-6 border-t border-[#112D22] text-center">
          <p className="font-serif text-sm font-semibold tracking-wide">
            "Preserving Traditions. Empowering Artisans. Connecting India to the World."
          </p>
          <p className="text-[10px] text-[#DEBFA3] mt-0.5">
            © 2026 Shilp Setu — Bridge of Crafts. Department of Posts & MoSJE Supported.
          </p>
        </footer>
      </div>
    </div>
  );
}