// src/app/ondc-network/page.tsx
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import OndcSection from "@/components/home/OndcSection";

export default function OndcNetworkPage() {
    return (
        <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                {/* Black ONDC Network Box displayed here separately */}
                <OndcSection />
            </div>
            <Footer />
        </main>
    );
}