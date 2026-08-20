// src/app/verified-artisans/page.tsx
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CraftCatalog from "@/components/home/CraftCatalog";

export default function VerifiedArtisansPage() {
    return (
        <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Header />
            <div className="py-6">
                {/* Products catalog displayed here separately */}
                <CraftCatalog />
            </div>
            <Footer />
        </main>
    );
}