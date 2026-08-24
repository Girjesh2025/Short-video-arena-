import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["300","400","500","600","700","800","900"] });

export const metadata = {
  title: "Video Arena 🦊 — World-Class Short Video Generator",
  description: "Generate premium AI-powered short videos with advanced customization for subtitles, audio, borders, and more.",
  keywords: ["AI video", "short video generator", "text to video", "MoneyPrinter"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#060913" />
      </head>
      <body className={outfit.className}>{children}</body>
    </html>
  );
}
