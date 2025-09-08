import type { Metadata } from "next";
import { Newsreader, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Header from "@/components/Header";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Eden Nails - Luxury Nail Salon",
  description: "Experience luxury nail care at Eden Nails. Professional manicures, pedicures, and nail art in a relaxing environment.",
  keywords: "nail salon, manicure, pedicure, nail art, luxury nails, beauty salon",
  icons: [
    { rel: 'icon', url: '/EdenFavicon.png', type: 'image/png' },
    { rel: 'shortcut icon', url: '/EdenFavicon.png', type: 'image/png' },
    { rel: 'apple-touch-icon', url: '/EdenFavicon.png', type: 'image/png' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/EdenFavicon.png" />
        <link rel="shortcut icon" type="image/png" href="/EdenFavicon.png" />
        <link rel="apple-touch-icon" type="image/png" href="/EdenFavicon.png" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?display=swap&family=Newsreader:wght@400;500;700;800&family=Noto+Sans:wght@400;500;700;900"
        />
      </head>
      <body className={`${newsreader.className} ${playfair.variable} relative flex min-h-screen flex-col bg-white overflow-x-hidden`}>
        <div className="layout-container flex h-full grow flex-col">
          <Header />
          {children}
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
