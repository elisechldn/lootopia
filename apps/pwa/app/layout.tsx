import type { Metadata, Viewport } from "next";
import { Unbounded, Lato} from "next/font/google";

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-lato"
});

export const metadata: Metadata = {
  title: "Lootopia",
  description: "Application to hunt treasures and win prizes",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lato.variable} ${unbounded.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
