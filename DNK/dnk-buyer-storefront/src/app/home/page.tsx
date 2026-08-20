// src/app/home/page.tsx
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";

export default function MarketplaceHomePage() {
    return (
        <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Header />
            {/* Retain Hero Section & CN23 Tracking */}
            <HeroSection />
            <Footer />
        </main>
    );
}