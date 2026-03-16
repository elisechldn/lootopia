import type {Metadata} from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
});

export const metadata: Metadata = {
    title: "Lootopia",
    description: "La solution de gestion parcours interactifs en réalité augmentée",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" className={cn("font-sans", geist.variable)}>
        <body className={`${geistSans.variable} font-sans antialiased`}>
        {children}
        </body>
        </html>
    );
}