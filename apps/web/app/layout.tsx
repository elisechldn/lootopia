import type {Metadata} from "next";
import localFont from "next/font/local";
import "./globals.css";

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
        <html lang="fr">
        <body className={`${geistSans.variable} font-sans antialiased`}>
        {children}
        </body>
        </html>
    );
}