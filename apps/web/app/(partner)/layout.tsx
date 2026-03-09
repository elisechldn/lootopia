import PartnerSidebar from "@/components/partner/PartnerSidebar";
import React from "react";

export default function PartnerLayout({
                                          children,
                                      }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <PartnerSidebar/>
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}