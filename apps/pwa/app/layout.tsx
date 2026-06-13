import type { Metadata, Viewport } from "next";
import { Bitter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";

const bitter = Bitter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lootopia",
  description:
    "La solution de gestion parcours interactifs en réalité augmentée",
  appleWebApp: {
    capable: true,
    title: "Lootopia",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: [
      { url: "/logo_192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo_512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  //Indique au navigateur que la largeur du site doit correspondre à la largeur de l'écran de l'appareil.
  // Sans cela, un mobile pourrait essayer de "dézoomer" pour afficher le site comme sur un ordinateur de bureau.
  width: "device-width",
  initialScale: 1,
  // Ces deux paramètres empêchent l'utilisateur de "pincer pour zoomer".
  maximumScale: 1,
  userScalable: false,
  // Essentiel pour les smartphones modernes avec des encoches (notches) ou des bords arrondis (comme l'iPhone).
  // Cela permet au contenu de s'étendre sur toute la surface de l'écran, y compris derrière les zones "non-rectangulaires".
  viewportFit: "cover",
  // Couleur de la barre de statut au premier paint (suit l'OS) — alignée sur --background.
  // Après hydratation, ThemeColorSync impose la couleur du thème résolu (override manuel inclus).
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bitter.variable} ${bitter.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
