// src/app/home/page.tsx
import Header from "@/components/dwara/layout/Header";
import Footer from "@/components/dwara/layout/Footer";
import HeroSection from "@/components/dwara/home/HeroSection";

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