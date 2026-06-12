import type { Metadata } from "next";
import "./globals.css";
import { Bitter, Special_Elite, Caveat } from "next/font/google";
import { cn } from "@/lib/utils";

// Texte courant (Slab)
const bitter = Bitter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

//"Machine à écrire" pour les titres et le logo
const specialElite = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-stamp",
});

//Police manuscrite pour les post-it et détails de jeu
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-hand",
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Lootopia",
  description:
    "La solution de gestion parcours interactifs en réalité augmentée",
};

export default function RootLayout({
    children,
    modal,
}: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>) {
    return (
        <html lang="fr" className={cn("font-sans", bitter.variable)}>
        <head>
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                            (function() {
                                try {
                                    const theme = localStorage.getItem('lootopia_theme');
                                    const root = document.documentElement;
                                    if (theme === 'dark') {
                                        root.classList.add('dark');
                                    } else if (theme === 'light') {
                                        root.classList.remove('dark');
                                    } else {
                                        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                                            root.classList.add('dark');
                                        }
                                    }
                                } catch(e) {}
                            })();
                        `,
          }}
        />
      </head>
      <body
        className={cn(
          bitter.variable,
          specialElite.variable,
          caveat.variable,
          "font-sans antialiased",
        )}
      >
        {children}
        {modal}
      </body>
    </html>
  );
}
