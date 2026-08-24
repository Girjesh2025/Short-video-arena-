import "./globals.css";

export const metadata = {
  title: "MoneyPrinterTurbo 2026 - AI Short Video Generator",
  description: "Generate highly engaging, automated short videos with custom borders and voice synchronizations.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#030712] text-slate-100 font-['Outfit',sans-serif] min-h-screen antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
