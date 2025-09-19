import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import Script from "next/script"; 


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CargoWeen",
  description: "Plateforme de réservation de fret aérien",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LanguageProvider>{children}</LanguageProvider>
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/js/all.min.js"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
