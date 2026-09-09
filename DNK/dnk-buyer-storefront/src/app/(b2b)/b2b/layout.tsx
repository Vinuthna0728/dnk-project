"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { B2BNavbar } from "@/components/b2b/B2BNavbar";
import { B2BSidebar } from "@/components/b2b/B2BSidebar";

export default function B2BLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Strip sidebar, navbar, and cart completely for login and verify pages
    const isAuth = pathname === "/b2b/login" || pathname === "/b2b/verify" || pathname.startsWith("/b2b/login") || pathname.startsWith("/b2b/verify");

    if (isAuth) {
        return <main className="min-h-screen w-screen overflow-hidden p-0 m-0">{children}</main>;
    }

    return (
        <div className="min-h-screen w-full flex flex-row bg-[#FAF7F2] font-poppins">
            <B2BSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <B2BNavbar />
                <main className="flex-1 p-6 lg:p-10">{children}</main>
            </div>
        </div>
    );
}