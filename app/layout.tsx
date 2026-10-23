import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Peppa · Ropa de noche en Tucumán",
    template: "%s · Peppa",
  },
  description:
    "Vestidos de fiesta, tops, bodys y polleras que no vas a encontrar en otro local de Tucumán. Pocas unidades por modelo. Pedidos por WhatsApp y envíos a todo el país.",
  keywords: ["ropa de noche Tucumán", "vestidos de fiesta Tucumán", "Peppa", "tops", "bodys", "polleras"],
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Peppa",
  },
};

export const viewport: Viewport = {
  themeColor: "#2E231E",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${display.variable} ${body.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
