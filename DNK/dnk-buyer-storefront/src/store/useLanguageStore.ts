import { create } from "zustand";

export type LanguageCode = "en" | "hi" | "kn" | "te" | "ml" | "mr" | "bn" | "ta";

export interface TranslationDict {
    crafts: string;
    myOrders: string;
    settings: string;
    helpSupport: string;
    logout: string;
    searchPlaceholder: string;
    all: string;
    textiles: string;
    pottery: string;
    metalcraft: string;
    woodcraft: string;
    fairPrice: string;
    buyNow: string;
    aiEnhanced: string;
    saveChanges: string;
    trackShipment: string;
    profileDetails: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDict> = {
    en: {
        crafts: "Crafts Catalog",
        myOrders: "My Orders",
        settings: "Settings",
        helpSupport: "Help & Support",
        logout: "Log Out",
        searchPlaceholder: "Search crafts, master artisans, or regions...",
        all: "All",
        textiles: "Textiles",
        pottery: "Pottery",
        metalcraft: "Metalcraft",
        woodcraft: "Woodcraft",
        fairPrice: "Artisan Fair Price",
        buyNow: "Buy",
        aiEnhanced: "AI Studio Enhanced",
        saveChanges: "Save Changes",
        trackShipment: "Track Parcel",
        profileDetails: "Buyer Profile Settings",
    },
    hi: {
        crafts: "शिल्प कैटलॉग",
        myOrders: "मेरे ऑर्डर",
        settings: "सेटिंग्स",
        helpSupport: "सहायता एवं समर्थन",
        logout: "लॉग आउट",
        searchPlaceholder: "हस्तशिल्प, शिल्पकार या क्षेत्र खोजें...",
        all: "सभी",
        textiles: "वस्त्र",
        pottery: "मिट्टी के बर्तन",
        metalcraft: "धातु शिल्प",
        woodcraft: "काष्ठ शिल्प",
        fairPrice: "कारीगर उचित मूल्य",
        buyNow: "खरीदें",
        aiEnhanced: "एआई स्टूडियो द्वारा संवर्धित",
        saveChanges: "बदलाव सहेजें",
        trackShipment: "ट्रैक करें",
        profileDetails: "प्रोफ़ाइल सेटिंग्स",
    },
    kn: {
        crafts: "ಕರಕುಶಲ ವಸ್ತುಗಳು",
        myOrders: "ನನ್ನ ಆರ್ಡರ್‌ಗಳು",
        settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
        helpSupport: "ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ",
        logout: "ಲಾಗ್ ಔಟ್",
        searchPlaceholder: "ಕರಕುಶಲ ವಸ್ತುಗಳನ್ನು ಹುಡುಕಿ...",
        all: "ಎಲ್ಲಾ",
        textiles: "ವಸ್ತ್ರಗಳು",
        pottery: "ಮಡಕೆ ಕೆಲಸ",
        metalcraft: "ಲೋಹದ ಕಲೆ",
        woodcraft: "ಮರದ ಕೆತ್ತನೆ",
        fairPrice: "ನ್ಯಾಯಯುತ ಬೆಲೆ",
        buyNow: "ಖರೀದಿಸಿ",
        aiEnhanced: "AI ವರ್ಧಿತ",
        saveChanges: "ಉಳಿಸಿ",
        trackShipment: "ಪಾರ್ಸೆಲ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
        profileDetails: "ಪ್ರೊಫೈಲ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    },
    te: {
        crafts: "చేతివృత్తులు",
        myOrders: "నా ఆర్డర్లు",
        settings: "సెట్టింగ్‌లు",
        helpSupport: "సహాయం & మద్దతు",
        logout: "లాగ్ అవుట్",
        searchPlaceholder: "హస్తకళలను వెతకండి...",
        all: "అన్నీ",
        textiles: "వస్త్రాలు",
        pottery: "మట్టి పాత్రలు",
        metalcraft: "లోహ కళ",
        woodcraft: "చెక్క కళ",
        fairPrice: "సరసమైన ధర",
        buyNow: "కొనుగోలు",
        aiEnhanced: "AI స్టూడియో మెరుగుపరిచింది",
        saveChanges: "సేవ్ చేయండి",
        trackShipment: "పార్శిల్ ట్రాక్ చేయండి",
        profileDetails: "ప్రొఫైల్ సెట్టింగ్‌లు",
    },
    ml: {
        crafts: "കരകൗശലങ്ങൾ",
        myOrders: "എന്റെ ഓർഡറുകൾ",
        settings: "ക്രമീകരണങ്ങൾ",
        helpSupport: "സഹായം",
        logout: "ലോഗ് ഔട്ട്",
        searchPlaceholder: "കരകൗശല വസ്തുക്കൾ തിരയുക...",
        all: "എല്ലാം",
        textiles: "തുണിത്തരങ്ങൾ",
        pottery: "മൺപാത്രങ്ങൾ",
        metalcraft: "ലോഹം",
        woodcraft: "തടി",
        fairPrice: "യഥാർത്ഥ വില",
        buyNow: "വാങ്ങുക",
        aiEnhanced: "AI മെച്ചപ്പെടുത്തിയത്",
        saveChanges: "മാറ്റങ്ങൾ സംരക്ഷിക്കുക",
        trackShipment: "പാഴ്സൽ ട്രാക്ക് ചെയ്യുക",
        profileDetails: "പ്രൊഫൈൽ ക്രമീകരണങ്ങൾ",
    },
    mr: {
        crafts: "शिल्पकला",
        myOrders: "माझे ऑर्डर्स",
        settings: "सेटिंग्ज",
        helpSupport: "मदत आणि सहाय्य",
        logout: "लॉग आउट",
        searchPlaceholder: "हस्तकला किंवा कारागीर शोधा...",
        all: "सर्व",
        textiles: "वस्त्र",
        pottery: "मातीची भांडी",
        metalcraft: "धातू काम",
        woodcraft: "लाकडी काम",
        fairPrice: "योग्य किंमत",
        buyNow: "खरेदी करा",
        aiEnhanced: "AI स्टुडिओ सुधारित",
        saveChanges: "जतन करा",
        trackShipment: "पार्सल ट्रॅक करा",
        profileDetails: "प्रोफाइल सेटिंग्ज",
    },
    bn: {
        crafts: "হস্তশিল্প",
        myOrders: "আমার অর্ডারসমূহ",
        settings: "সেটিংস",
        helpSupport: "সাহায্য",
        logout: "লগ আউট",
        searchPlaceholder: "হস্তশিল্প অনুসন্ধান করুন...",
        all: "সকল",
        textiles: "বস্ত্রশিল্প",
        pottery: "মৃৎশিল্প",
        metalcraft: "ধাতুশিল্প",
        woodcraft: "দারুশিল্প",
        fairPrice: "ন্যায্য মূল্য",
        buyNow: "কিনুন",
        aiEnhanced: "এআই উন্নত",
        saveChanges: "সংরক্ষণ করুন",
        trackShipment: "পার্সেল ট্র্যাক করুন",
        profileDetails: "প্রোফাইল সেটিংস",
    },
    ta: {
        crafts: "கைவினைப்பொருட்கள்",
        myOrders: "எனது ஆர்டர்கள்",
        settings: "அமைப்புகள்",
        helpSupport: "உதவி",
        logout: "வெளியேறு",
        searchPlaceholder: "கைவினைப்பொருட்களைத் தேடுங்கள்...",
        all: "அனைத்தும்",
        textiles: "ஜவுளி",
        pottery: "மண்பாண்டங்கள்",
        metalcraft: "உலோக கலை",
        woodcraft: "மர வேலைப்பாடு",
        fairPrice: "நியாயமான விலை",
        buyNow: "வாங்கு",
        aiEnhanced: "AI மேம்படுத்தப்பட்டது",
        saveChanges: "சேமிக்கவும்",
        trackShipment: "பார்சல் கண்காணிக்கவும்",
        profileDetails: "சுயவிவர அமைப்புகள்",
    },
};

interface LanguageState {
    currentLang: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
    t: () => TranslationDict;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
    currentLang: "en",
    setLanguage: (lang) => set({ currentLang: lang }),
    t: () => TRANSLATIONS[get().currentLang] || TRANSLATIONS.en,
}));