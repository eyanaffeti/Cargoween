"use client";

import Navbarlight from "@/components/Navbarlight";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function IdentificationPage() {
  const { language } = useLanguage();

  return (
    <>
      {/* ✅ Navbar */}
      <Navbarlight />

      {/* ✅ Contenu principal */}
      <section
        className="flex flex-col h-[871px] items-center min-h-screen bg-cover bg-center pt-32"
        style={{
          backgroundImage: "url('/world-map.png')",
        }}
      >
        {/* ✅ Titre */}
        <h1 className="text-[#121B2D] text-5xl font-medium mb-16">
          <br />
          {language === "fr"
            ? "Veuillez-Vous Identifier ?"
            : "Please Identify Yourself"}
        </h1>

        {/* ✅ Cartes */}
        <div className="flex gap-16">
          {/* ✅ Carte Transitaires */}
          <Link href="/Transitaire-signup">
            <div className="w-[538px] h-[371px] bg-[#121B2D] rounded-3xl shadow-lg cursor-pointer hover:scale-105 transition-all duration-300">
              <Image
                src="/transitaire-image.png"
                alt={language === "fr" ? "Transitaires" : "Forwarders"}
                width={366}
                height={244}
                className="mx-auto mt-10 rounded-lg"
              />
              <h2 className="text-white text-2xl font-medium text-center mt-6">
                {language === "fr" ? "Transitaire" : "Forwarder"}
              </h2>
            </div>
          </Link>

          {/* ✅ Carte Compagnie Aérienne */}
          <Link href="/airline-signup">
            <div className="w-[538px] h-[375px] bg-[#121B2D] rounded-3xl shadow-lg cursor-pointer hover:scale-105 transition-all duration-300">
              <Image
                src="/airline-image.png"
                alt={language === "fr" ? "Compagnie Aérienne" : "Airline"}
                width={269}
                height={269}
                className="mx-auto mt-9 rounded-lg"
              />
              <h2 className="text-white text-2xl font-medium text-center mt-6">
                {language === "fr" ? "Compagnie Aérienne" : "Airline"}
              </h2>
            </div>
          </Link>
        </div>
      </section>

      {/* ✅ Footer */}
      <Footer />
    </>
  );
}
